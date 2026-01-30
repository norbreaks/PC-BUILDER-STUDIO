from bson import ObjectId

def convert_objectid(obj):
    """Recursively convert any bson.ObjectId to str inside dict/list."""
    if isinstance(obj, dict):
        return {k: convert_objectid(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_objectid(v) for v in obj]
    if isinstance(obj, ObjectId):
        return str(obj)
    return obj

def _normalize_part_doc(doc: dict) -> dict:
    """Normalize a part document from the database for Pydantic model creation."""
    if not doc:
        return doc

    normalized = doc.copy()

    # Handle price field - convert currency strings to float
    if 'price' in normalized and isinstance(normalized['price'], str):
        # Remove ₹ symbol and commas, then convert to float
        price_str = normalized['price'].replace('₹', '').replace(',', '')
        try:
            normalized['price'] = float(price_str)
        except ValueError:
            # If conversion fails, keep original value
            pass

    return normalized
