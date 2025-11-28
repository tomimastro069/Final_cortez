from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from typing import List

from models.product import ProductModel
from repositories.base_repository_impl import BaseRepositoryImpl
from schemas.product_schema import ProductSchema


class ProductRepository(BaseRepositoryImpl):
    """Repository for Product entity database operations."""

    def __init__(self, db: Session):
        super().__init__(ProductModel, ProductSchema, db)

    def find_all(self, skip: int = 0, limit: int = 100) -> List[ProductSchema]:
        """
        Overrides the base find_all to optimize product-category loading.

        This implementation uses 'joinedload' to prevent the N+1 query problem
        by fetching all related categories in a single JOIN query.

        To avoid circular reference issues, we don't load the products relationship
        from the category side.
        """
        from sqlalchemy.orm import selectinload

        stmt = (
            select(self.model)
            .options(selectinload(self.model.category))  # Use selectinload instead of joinedload
            .offset(skip)
            .limit(limit)
        )
        models = self.session.scalars(stmt).all()

        # Convert to schema without the circular products reference
        result = []
        for model in models:
            # Create a dict representation and remove the products from category
            product_dict = model.__dict__.copy()
            if model.category:
                category_dict = model.category.__dict__.copy()
                # Remove the products relationship to avoid circular reference
                category_dict.pop('products', None)
                product_dict['category'] = category_dict
            else:
                product_dict['category'] = None

            # Remove SQLAlchemy internal fields
            product_dict.pop('_sa_instance_state', None)

            result.append(self.schema.model_validate(product_dict))

        return result
