# Import all schemas to make them available in this namespace
from .address_schema import AddressSchema
from .bill_schema import BillSchema
from .category_schema import CategorySchema, CategoryBaseSchema
from .client_schema import ClientSchema
from .login_schema import LoginRequest, LoginResponse
from .order_detail_schema import OrderDetailSchema
from .order_schema import (
    OrderSchema, OrderCreateSchema, OrderUpdateSchema, OrderBaseSchema
)
from .product_schema import (
    ProductSchema, ProductBaseSchema, ProductAdminSchema
)
from .review_schema import ReviewSchema, ReviewBaseSchema

# A list of all schema classes that might have forward references
# and need to be rebuilt.
# We rebuild all of them to be safe and handle any dependencies.
schemas_to_rebuild = [
    AddressSchema,
    BillSchema,
    CategorySchema, CategoryBaseSchema,
    ClientSchema,
    # Login schemas do not use forward refs, but it's safe to include
    # LoginRequest, LoginResponse, 
    OrderDetailSchema,
    OrderSchema, OrderCreateSchema, OrderUpdateSchema, OrderBaseSchema,
    ProductSchema, ProductBaseSchema, ProductAdminSchema,
    ReviewSchema, ReviewBaseSchema,
]

# Rebuild all schemas to resolve any forward references
for schema in schemas_to_rebuild:
    # The `if hasattr` check is a safeguard for non-Pydantic objects
    # or schemas that don't need rebuilding.
    if hasattr(schema, 'model_rebuild'):
        schema.model_rebuild()
