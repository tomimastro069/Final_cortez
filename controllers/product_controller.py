from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import Depends, Query
from controllers.base_controller_impl import BaseControllerImpl
from schemas.product_schema import ProductSchema
from services.product_service import ProductService
from config.database import get_db


class ProductController(BaseControllerImpl):
    """Controlador de productos con CRUD y filtrado."""

    def __init__(self):
        super().__init__(
            schema=ProductSchema,
            service_factory=lambda db: ProductService(db),
            tags=["Products"]
        )
        self._register_filter_route()

    def _register_filter_route(self):
        """Endpoint /filter funcional"""

        @self.router.get("/filter", response_model=List[ProductSchema])
        async def filter_products(
            search: Optional[str] = None,
            category_id: Optional[int] = None,
            min_price: Optional[float] = None,
            max_price: Optional[float] = None,
            in_stock_only: Optional[bool] = False,
            sort_by: Optional[str] = None,
            skip: int = 0,
            limit: int = 100,
            db: Session = Depends(get_db)
        ):
            service = self.service_factory(db)
            return service.filter_products(
                search=search,
                category_id=category_id,
                min_price=min_price,
                max_price=max_price,
                in_stock_only=in_stock_only,
                sort_by=sort_by,
                skip=skip,
                limit=limit
            )
