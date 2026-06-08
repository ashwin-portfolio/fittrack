"""
Database validation script — run with: python validate_db.py
Checks: tables, UUID PKs, foreign keys, indexes, constraints
"""
from app.db.session import engine
from sqlalchemy import text

SEP = "-" * 72


def section(title: str) -> None:
    print(f"\n{'=' * 72}")
    print(f"  {title}")
    print(f"{'=' * 72}")


def run(conn, sql: str):
    return conn.execute(text(sql)).fetchall()


with engine.connect() as conn:

    # ── 1. Tables ─────────────────────────────────────────────────────────────
    section("1. TABLES")
    rows = run(conn, """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          AND table_name != 'alembic_version'
        ORDER BY table_name
    """)
    expected = {
        "users", "profiles", "goals", "refresh_tokens", "exercises",
        "workout_sessions", "workout_exercises", "exercise_sets",
        "nutrition_entries", "weight_logs", "activity_feed_items",
        "kudos", "comments", "follows",
    }
    found = {r[0] for r in rows}
    for t in sorted(found):
        print(f"  {'OK' if t in expected else 'UNEXPECTED':8}  {t}")
    missing = expected - found
    if missing:
        print(f"\n  MISSING: {missing}")
    print(f"\n  Total: {len(found)}/14  {'PASS' if found == expected else 'FAIL'}")

    # ── 2. UUID Primary Keys ─────────────────────────────────────────────────
    section("2. UUID PRIMARY KEYS")
    rows = run(conn, """
        SELECT c.table_name, c.column_name, c.data_type
        FROM information_schema.columns c
        JOIN information_schema.table_constraints tc
            ON tc.table_name = c.table_name AND tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = 'public'
        JOIN information_schema.key_column_usage kcu
            ON kcu.constraint_name = tc.constraint_name
            AND kcu.column_name = c.column_name
        WHERE c.table_schema = 'public' AND c.table_name != 'alembic_version'
        ORDER BY c.table_name
    """)
    all_uuid = True
    print(f"  {'Table':<32} {'Column':<20} {'Type':<10} Status")
    print(f"  {SEP}")
    for table, col, dtype in rows:
        ok = dtype == "uuid"
        if not ok:
            all_uuid = False
        print(f"  {table:<32} {col:<20} {dtype:<10} {'OK' if ok else 'FAIL'}")
    print(f"\n  Result: {'PASS — all PKs are UUID' if all_uuid else 'FAIL — non-UUID PK found'}")

    # ── 3. Foreign Keys ───────────────────────────────────────────────────────
    section("3. FOREIGN KEYS")
    rows = run(conn, """
        SELECT
            tc.table_name       AS from_table,
            kcu.column_name     AS from_col,
            ccu.table_name      AS to_table,
            ccu.column_name     AS to_col,
            rc.delete_rule
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON kcu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints rc
            ON rc.constraint_name = tc.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name = rc.unique_constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
        ORDER BY tc.table_name, kcu.column_name
    """)
    print(f"  {'From Table':<28} {'Column':<28} {'-> Table.Column':<30} Delete Rule")
    print(f"  {SEP}")
    for from_t, from_c, to_t, to_c, del_rule in rows:
        print(f"  {from_t:<28} {from_c:<28} {to_t + '.' + to_c:<30} {del_rule}")
    print(f"\n  Total foreign keys: {len(rows)}")

    # ── 4. Indexes ────────────────────────────────────────────────────────────
    section("4. INDEXES")
    rows = run(conn, """
        SELECT
            tablename,
            indexname,
            indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename != 'alembic_version'
        ORDER BY tablename, indexname
    """)
    current_table = None
    for table, idxname, idxdef in rows:
        if table != current_table:
            print(f"\n  [{table}]")
            current_table = table
        unique = "UNIQUE" if "UNIQUE" in idxdef else "      "
        partial = "(partial)" if "WHERE" in idxdef else ""
        print(f"    {unique}  {idxname:<45} {partial}")
    print(f"\n  Total indexes: {len(rows)}")

    # ── 5. Constraints (CHECK + UNIQUE) ───────────────────────────────────────
    section("5. CONSTRAINTS (CHECK + UNIQUE)")
    rows = run(conn, """
        SELECT
            tc.table_name,
            tc.constraint_name,
            tc.constraint_type,
            cc.check_clause
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.check_constraints cc
            ON cc.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.constraint_type IN ('CHECK', 'UNIQUE')
          AND tc.table_name != 'alembic_version'
        ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name
    """)
    print(f"  {'Table':<28} {'Type':<10} {'Name':<45} Clause")
    print(f"  {SEP}")
    for table, name, ctype, clause in rows:
        clause_str = (clause or "")[:40]
        print(f"  {table:<28} {ctype:<10} {name:<45} {clause_str}")
    print(f"\n  Total: {len(rows)}")

    # ── 6. Soft-delete columns present ───────────────────────────────────────
    section("6. SOFT DELETE COLUMNS (deleted_at)")
    soft_delete_tables = [
        "workout_sessions", "nutrition_entries",
        "activity_feed_items", "comments",
    ]
    rows = run(conn, """
        SELECT table_name, column_name, is_nullable, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'deleted_at'
        ORDER BY table_name
    """)
    found_soft = {r[0] for r in rows}
    for table, col, nullable, dtype in rows:
        print(f"  OK  {table:<30} deleted_at  nullable={nullable}  type={dtype}")
    missing_soft = set(soft_delete_tables) - found_soft
    if missing_soft:
        print(f"  MISSING deleted_at on: {missing_soft}")
    extra_soft = found_soft - set(soft_delete_tables)
    if extra_soft:
        print(f"  UNEXPECTED deleted_at on: {extra_soft}")
    print(f"\n  Result: {'PASS' if not missing_soft and not extra_soft else 'FAIL'}")

    # ── 7. Seed data ──────────────────────────────────────────────────────────
    section("7. SEED DATA (system exercises)")
    rows = run(conn, """
        SELECT muscle_group, COUNT(*) as cnt
        FROM exercises
        WHERE is_system = true
        GROUP BY muscle_group
        ORDER BY muscle_group
    """)
    total = 0
    for group, cnt in rows:
        total += cnt
        print(f"  {group:<15} {cnt} exercises")
    print(f"\n  Total system exercises: {total}  {'PASS' if total == 44 else 'FAIL'}")

print("\n\nValidation complete.")
