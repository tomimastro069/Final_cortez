import logging
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import select, and_, or_
from typing import List, Optional

from models.product import ProductModel
from repositories.base_repository_impl import BaseRepositoryImpl
from schemas.product_schema import ProductSchema

logger = logging.getLogger(__name__)

class ProductRepository(BaseRepositoryImpl):
    """Repository for Product entity database operations."""

    def __init__(self, db: Session):
        super().__init__(ProductModel, ProductSchema, db)

    # ============================================================
    # =                 FIND ALL (YA EXISTENTE)                   =
    # ============================================================
    def find_all(self, skip: int = 0, limit: int = 100) -> List[ProductSchema]:
        """
        Overrides the base find_all to optimize product-category loading.
        """
        stmt = (
            select(self.model)
            .options(selectinload(self.model.category))
            .offset(skip)
            .limit(limit)
        )
        models = self.session.scalars(stmt).all()

        result = []
        for model in models:
            product_dict = model.__dict__.copy()
            product_dict.pop('_sa_instance_state', None)

            if model.category:
                category_dict = model.category.__dict__.copy()
                category_dict.pop('_sa_instance_state', None)
                category_dict.pop('products', None)
                product_dict['category'] = category_dict
            else:
                product_dict['category'] = None

            result.append(self.schema.model_validate(product_dict))

        return result

    # ============================================================
    # =                FILTER PRODUCTS (NUEVO)                    =
    # ============================================================
    def filter_products(
        self,
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock_only: bool = False,
        sort_by: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ProductSchema]:
        """
        Advanced product filtering compatible with caching.
        """

        stmt = select(self.model).options(
            selectinload(self.model.category)
        )

        filters = []

        # 🔎 Search by name/description
        if search:
            filters.append(self.model.name.ilike(f"%{search}%"))

        # 📁 Filter by category
        if category_id:
            filters.append(self.model.category_id == category_id)

        # 💵 Price min
        if min_price is not None:
            filters.append(self.model.price >= min_price)

        # 💵 Price max
        if max_price is not None:
            filters.append(self.model.price <= max_price)

        # 📦 In stock only
        if in_stock_only:
            filters.append(self.model.stock > 0)

        # Apply filters
        if filters:
            stmt = stmt.where(and_(*filters))

        # 🔽 Sorting
        if sort_by == "price_asc":
            stmt = stmt.order_by(self.model.price.asc())
        elif sort_by == "price_desc":
            stmt = stmt.order_by(self.model.price.desc())
        elif sort_by == "name_asc":
            stmt = stmt.order_by(self.model.name.asc())
        elif sort_by == "name_desc":
            stmt = stmt.order_by(self.model.name.desc())

        # Pagination
        stmt = stmt.offset(skip).limit(limit)

        try:
            models = self.session.scalars(stmt).all()
        except Exception as e:
            logger.error(f"Error executing product filter query: {e}", exc_info=True)
            raise # Re-raise the exception after logging

        # Convert to schema
        result = []
        for model in models:
            product_dict = model.__dict__.copy()
            product_dict.pop('_sa_instance_state', None)

            if model.category:
                category_dict = model.category.__dict__.copy()
                category_dict.pop('_sa_instance_state', None)
                category_dict.pop('products', None)
                product_dict['category'] = category_dict
            else:
                product_dict['category'] = None

            result.append(self.schema.model_validate(product_dict))

        return result
