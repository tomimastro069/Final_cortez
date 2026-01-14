from typing import Optional, TYPE_CHECKING
from pydantic import Field, ConfigDict

from schemas.base_schema import BaseSchema

if TYPE_CHECKING:
    # This avoids circular imports
    from schemas.product_schema import ProductBaseSchema


# ✅ NEW: Base schema for a review, without the 'product' field
class ReviewBaseSchema(BaseSchema):
    """
    Base schema for a product review.

    This schema contains all review fields except for the nested 'product'
    to prevent circular dependencies when nesting reviews within a product.
    """
    model_config = ConfigDict(from_attributes=True)

    rating: float = Field(
        ...,
        ge=1.0,
        le=5.0,
        description="Rating from 1 to 5 stars (required)"
    )
    comment: Optional[str] = Field(
        None,
        min_length=10,
        max_length=1000,
        description="Review comment (optional, 10-1000 characters)"
    )
    product_id: int = Field(
        ...,
        description="Product ID reference (required)"
    )


# ✅ UPDATED: Full schema for a review, including the related product
class ReviewSchema(ReviewBaseSchema):
    """
    Full schema for a product review.

    Includes the nested 'product' relationship. To avoid circular dependencies,
    it uses 'ProductBaseSchema', which does not contain nested reviews.
    """
    product: Optional['ProductBaseSchema'] = None
