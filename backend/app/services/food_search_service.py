"""
Food search priority:
  1. Local Indian food database (instant, no network)
  2. USDA FoodData Central (branded foods, supplements, protein powders — free API)
  3. Open Food Facts fallback (international packaged goods)
"""
import httpx
from fastapi import HTTPException, status

from app.core.config import settings
from app.db.indian_foods import INDIAN_FOODS
from app.schemas.nutrition import FoodSearchListResponse, FoodSearchResult

_USDA_SEARCH = "https://api.nal.usda.gov/fdc/v1/foods/search"
_OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl"
_OFF_PRODUCT = "https://world.openfoodfacts.org/api/v2/product"
_OFF_FIELDS = "product_name,brands,nutriments,serving_size,serving_quantity,code"
_TIMEOUT = 7.0

# USDA nutrient IDs
_NID_KCAL = 1008
_NID_PROTEIN = 1003
_NID_CARBS = 1005
_NID_FAT = 1004


# ─── 1. Local Indian food database ───────────────────────────────────────────

def _local_search(q: str, limit: int) -> list[FoodSearchResult]:
    tokens = q.lower().split()
    scored: list[tuple[int, dict]] = []

    for food in INDIAN_FOODS:
        haystack = food["food_name"].lower() + " " + " ".join(food.get("tags", []))
        score = 0
        for token in tokens:
            if token in haystack:
                score += 2 if token in food["food_name"].lower() else 1
        if score > 0:
            scored.append((score, food))

    scored.sort(key=lambda x: (-x[0], x[1]["food_name"]))

    return [
        FoodSearchResult(
            food_name=food["food_name"],
            brand=food.get("brand"),
            barcode=None,
            calories_per_100g=food.get("calories_per_100g"),
            protein_per_100g=food.get("protein_per_100g"),
            carbs_per_100g=food.get("carbs_per_100g"),
            fat_per_100g=food.get("fat_per_100g"),
            serving_description=food.get("serving_description"),
            serving_weight_g=food.get("serving_weight_g"),
        )
        for _, food in scored[:limit]
    ]


# ─── 2. USDA FoodData Central ────────────────────────────────────────────────

def _parse_usda_food(f: dict) -> FoodSearchResult | None:
    name = (f.get("description") or "").strip()
    if not name:
        return None

    # Map nutrient list to a lookup dict keyed by nutrientId
    nutrient_map: dict[int, float] = {}
    for n in f.get("foodNutrients", []):
        nid = n.get("nutrientId") or n.get("nutrientNumber")
        val = n.get("value")
        if nid and val is not None:
            try:
                nutrient_map[int(nid)] = float(val)
            except (TypeError, ValueError):
                pass

    # Values are per 100g in the search endpoint
    kcal = nutrient_map.get(_NID_KCAL)
    protein = nutrient_map.get(_NID_PROTEIN)
    carbs = nutrient_map.get(_NID_CARBS)
    fat = nutrient_map.get(_NID_FAT)

    # Brand: prefer brandName, fall back to brandOwner
    brand = (f.get("brandName") or f.get("brandOwner") or "").strip() or None

    # Serving size
    serving_weight_g: float | None = None
    serving_desc: str | None = None

    # householdServingFullText is the clearest: "1 scoop (30 g)"
    household = (f.get("householdServingFullText") or "").strip()
    serving_size = f.get("servingSize")
    serving_unit = (f.get("servingSizeUnit") or "").upper()

    if household:
        serving_desc = household

    if serving_size is not None and serving_unit in ("G", "GRM", "GRAMS"):
        try:
            serving_weight_g = round(float(serving_size), 1)
            if not serving_desc:
                serving_desc = f"{serving_weight_g}g"
        except (TypeError, ValueError):
            pass

    return FoodSearchResult(
        food_name=name.title() if name.isupper() else name,
        brand=brand,
        barcode=f.get("gtinUpc") or None,
        calories_per_100g=round(kcal, 1) if kcal is not None else None,
        protein_per_100g=round(protein, 2) if protein is not None else None,
        carbs_per_100g=round(carbs, 2) if carbs is not None else None,
        fat_per_100g=round(fat, 2) if fat is not None else None,
        serving_description=serving_desc,
        serving_weight_g=serving_weight_g,
    )


def _usda_search(q: str, limit: int) -> list[FoodSearchResult]:
    try:
        r = httpx.get(
            _USDA_SEARCH,
            params={
                "query": q,
                "api_key": settings.USDA_FDC_API_KEY,
                "pageSize": min(limit * 2, 50),
                # Branded covers all packaged/supplement products
                # SR Legacy covers generic foods (chicken breast, rice, etc.)
                "dataType": "Branded,SR Legacy,Foundation",
                "sortBy": "score",
            },
            timeout=_TIMEOUT,
            follow_redirects=True,
        )
    except (httpx.TimeoutException, httpx.RequestError):
        return []

    if r.status_code == 403:
        # Bad/expired API key — silently skip
        return []
    if r.status_code >= 400:
        return []

    try:
        foods = r.json().get("foods", [])
    except Exception:
        return []

    results = []
    for f in foods:
        item = _parse_usda_food(f)
        if item is not None:
            results.append(item)
        if len(results) >= limit:
            break
    return results


# ─── 3. Open Food Facts (last-resort fallback) ───────────────────────────────

def _parse_off_product(p: dict) -> FoodSearchResult | None:
    name = (p.get("product_name") or "").strip()
    if not name:
        return None

    n = p.get("nutriments", {})

    def _f(key: str) -> float | None:
        v = n.get(key)
        try:
            return round(float(v), 2) if v is not None else None
        except (TypeError, ValueError):
            return None

    brand = ((p.get("brands") or "").split(",")[0].strip()) or None
    barcode = (p.get("code") or "").strip() or None
    serving_desc = (p.get("serving_size") or "").strip() or None

    serving_weight_g: float | None = None
    try:
        sq = p.get("serving_quantity")
        serving_weight_g = round(float(sq), 1) if sq else None
    except (TypeError, ValueError):
        pass

    return FoodSearchResult(
        food_name=name,
        brand=brand,
        barcode=barcode,
        calories_per_100g=_f("energy-kcal_100g"),
        protein_per_100g=_f("proteins_100g"),
        carbs_per_100g=_f("carbohydrates_100g"),
        fat_per_100g=_f("fat_100g"),
        serving_description=serving_desc,
        serving_weight_g=serving_weight_g,
    )


def _off_search(q: str, limit: int) -> list[FoodSearchResult]:
    try:
        r = httpx.get(
            _OFF_SEARCH,
            params={
                "search_terms": q,
                "json": 1,
                "page_size": limit,
                "fields": _OFF_FIELDS,
                "search_simple": 1,
                "action": "process",
            },
            timeout=_TIMEOUT,
            follow_redirects=True,
        )
    except (httpx.TimeoutException, httpx.RequestError):
        return []

    if r.status_code >= 500:
        return []

    try:
        products = r.json().get("products", [])
    except Exception:
        return []

    return [item for p in products if (item := _parse_off_product(p)) is not None]


# ─── Barcode lookup (USDA → OFF) ─────────────────────────────────────────────

def _off_barcode(barcode: str) -> FoodSearchResult:
    try:
        r = httpx.get(
            f"{_OFF_PRODUCT}/{barcode}",
            params={"fields": _OFF_FIELDS},
            timeout=_TIMEOUT,
            follow_redirects=True,
        )
    except (httpx.TimeoutException, httpx.RequestError):
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                            detail="Food database timed out. Try again.")

    if r.status_code == 404 or r.status_code >= 500:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"No product found for barcode {barcode}.")

    try:
        data = r.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY,
                            detail="Food database returned an invalid response.")

    if data.get("status") != 1:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"No product found for barcode {barcode}.")

    result = _parse_off_product(data.get("product", {}))
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Product found but has no nutrition data.")
    return result


# ─── Service ─────────────────────────────────────────────────────────────────

class FoodSearchService:
    def search(self, q: str, limit: int = 20) -> FoodSearchListResponse:
        seen_names: set[str] = set()
        combined: list[FoodSearchResult] = []

        def _add(items: list[FoodSearchResult]) -> None:
            for item in items:
                key = item.food_name.lower()
                if key not in seen_names:
                    seen_names.add(key)
                    combined.append(item)

        # 1. Local Indian database (always fast)
        _add(_local_search(q, limit))

        # 2. USDA FoodData Central (branded + generic foods)
        if len(combined) < limit:
            _add(_usda_search(q, limit - len(combined) + 10))

        # 3. Open Food Facts (last resort)
        if len(combined) < limit // 2:
            _add(_off_search(q, limit - len(combined) + 5))

        items = combined[:limit]
        return FoodSearchListResponse(items=items, total=len(items), query=q)

    def barcode_lookup(self, barcode: str) -> FoodSearchResult:
        # Try USDA by GTIN first (via search), then OFF
        usda = _usda_search(barcode, 5)
        for item in usda:
            if item.barcode == barcode:
                return item
        return _off_barcode(barcode)


food_search_service = FoodSearchService()
