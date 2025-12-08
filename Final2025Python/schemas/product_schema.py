"""Product schema for request/response validation."""
from typing import Optional, List, TYPE_CHECKING
from pydantic import Field

from schemas.base_schema import BaseSchema
from schemas.category_schema import CategoryBaseSchema  # ← CAMBIO IMPORTANTE

if TYPE_CHECKING:
    from schemas.order_detail_schema import OrderDetailSchema
    from schemas.review_schema import ReviewSchema


class ProductSchema(BaseSchema):
    """Schema for Product entity with validations."""

    name: str = Field(..., min_length=1, max_length=200, description="Product name (required)")
    price: float = Field(..., gt=0, description="Product price (must be greater than 0, required)")
    stock: int = Field(default=0, ge=0, description="Product stock quantity (must be >= 0)")

    category_id: Optional[int] = Field(None, description="Category ID reference (optional)")

    # ← Cambiar CategorySchema por CategoryBaseSchema
    category: Optional[CategoryBaseSchema] = None
    
    reviews: Optional[List['ReviewSchema']] = []
    order_details: Optional[List['OrderDetailSchema']] = []