"""Product schema for request/response validation."""
from typing import Optional, List, TYPE_CHECKING
from pydantic import Field, ConfigDict

from schemas.base_schema import BaseSchema
from schemas.category_schema import CategoryBaseSchema

if TYPE_CHECKING:
    from schemas.order_detail_schema import OrderDetailSchema
    from schemas.review_schema import ReviewSchema


class ProductBaseSchema(BaseSchema):
    """Schema básico de producto SIN relaciones anidadas para evitar referencias cíclicas."""

    name: str = Field(..., min_length=1, max_length=200, description="Product name (required)")
    price: float = Field(..., gt=0, description="Product price (must be greater than 0, required)")
    stock: int = Field(default=0, ge=0, description="Product stock quantity (must be >= 0)")

    category_id: Optional[int] = Field(None, description="Category ID reference (optional)")

    # Usar CategoryBaseSchema para evitar ciclos
    category: Optional[CategoryBaseSchema] = None


class ProductSchema(ProductBaseSchema):
    """Schema for Product entity with validations."""
    
    # ✅ CAMBIO CRÍTICO: Configurar para evitar ciclos en order_details
    model_config = ConfigDict(from_attributes=True)

    reviews: Optional[List['ReviewSchema']] = []
    order_details: Optional[List['OrderDetailSchema']] = []


class ProductAdminSchema(ProductBaseSchema):
    """Schema for Product entity in admin operations without nested relations."""
    pass