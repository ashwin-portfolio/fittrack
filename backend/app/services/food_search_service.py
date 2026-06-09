"""
Wraps Open Food Facts API for food search and barcode lookup.
No API key required. Free, open food database — 3M+ products globally.
"""
import httpx
from fastapi import HTTPException, status

from app.schemas.nutrition import FoodSearchListResponse, FoodSearchResult

_OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl"
_OFF_PRODUCT = "https://world.openfoodfacts.org/api/v2/product"
_FIELDS = "product_name,brands,nutriments,serving_size,serving_quantity,code"
_TIMEOUT = 8.0


def _parse_product(p: dict) -> FoodSearchResult | None:
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


def _get(url: str, params: dict) -> httpx.Response:
    try:
        return httpx.get(url, params=params, timeout=_TIMEOUT, follow_redirects=True)
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Food database timed out. Try again.",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach food database.",
        )


class FoodSearchService:
    def search(self, q: str, limit: int = 20) -> FoodSearchListResponse:
        r = _get(_OFF_SEARCH, {
            "search_terms": q,
            "json": 1,
            "page_size": limit,
            "fields": _FIELDS,
            "search_simple": 1,
            "action": "process",
        })

        if r.status_code >= 500:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Food database unavailable.",
            )

        try:
            products = r.json().get("products", [])
        except Exception:
            products = []

        items = [item for p in products if (item := _parse_product(p)) is not None]
        return FoodSearchListResponse(items=items, total=len(items), query=q)

    def barcode_lookup(self, barcode: str) -> FoodSearchResult:
        r = _get(f"{_OFF_PRODUCT}/{barcode}", {"fields": _FIELDS})

        if r.status_code == 404 or r.status_code >= 500:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No product found for barcode {barcode}.",
            )

        try:
            data = r.json()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Food database returned an invalid response.",
            )

        if data.get("status") != 1:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No product found for barcode {barcode}.",
            )

        result = _parse_product(data.get("product", {}))
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product found but has no nutrition data.",
            )
        return result


food_search_service = FoodSearchService()
