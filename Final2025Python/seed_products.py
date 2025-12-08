#!/usr/bin/env python3
"""
Seed script to populate the database with sample products for testing search functionality.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import get_db_session
from models.product import ProductModel
from models.category import CategoryModel

def seed_products():
    """Create sample products and categories for testing."""
    session = get_db_session()
    try:
        # Create categories if they don't exist
        categories_data = [
            {"name": "Laptops"},
            {"name": "Smartphones"},
            {"name": "Tablets"},
            {"name": "Accesorios"}
        ]

        categories = {}
        for cat_data in categories_data:
            category = session.query(CategoryModel).filter(CategoryModel.name == cat_data["name"]).first()
            if not category:
                category = CategoryModel(name=cat_data["name"])
                session.add(category)
                session.commit()
                session.refresh(category)
            categories[cat_data["name"]] = category

        # Create sample products
        products_data = [
            {
                "name": "Laptop ASUS ROG",
                "description": "Potente laptop para gaming con RTX 4070",
                "price": 2500.00,
                "stock": 10,
                "category": categories["Laptops"]
            },
            {
                "name": "iPhone 15 Pro",
                "description": "El último smartphone de Apple con chip A17",
                "price": 1200.00,
                "stock": 15,
                "category": categories["Smartphones"]
            },
            {
                "name": "MacBook Air M3",
                "description": "Laptop ultradelgada con chip M3 de Apple",
                "price": 1800.00,
                "stock": 8,
                "category": categories["Laptops"]
            },
            {
                "name": "Samsung Galaxy S24",
                "description": "Smartphone Android con cámara de 200MP",
                "price": 1000.00,
                "stock": 20,
                "category": categories["Smartphones"]
            },
            {
                "name": "iPad Pro 12.9",
                "description": "Tablet profesional con pantalla Liquid Retina XDR",
                "price": 1500.00,
                "stock": 12,
                "category": categories["Tablets"]
            },
            {
                "name": "Mouse Logitech MX Master",
                "description": "Mouse inalámbrico ergonómico para productividad",
                "price": 120.00,
                "stock": 25,
                "category": categories["Accesorios"]
            },
            {
                "name": "Teclado Mecánico RGB",
                "description": "Teclado gaming con switches mecánicos y iluminación RGB",
                "price": 180.00,
                "stock": 18,
                "category": categories["Accesorios"]
            },
            {
                "name": "Samsung Galaxy Tab S9",
                "description": "Tablet Android de alta gama con S Pen incluido",
                "price": 900.00,
                "stock": 14,
                "category": categories["Tablets"]
            }
        ]

        for product_data in products_data:
            # Check if product already exists
            existing = session.query(ProductModel).filter(ProductModel.name == product_data["name"]).first()
            if not existing:
                product = ProductModel(
                    name=product_data["name"],
                    description=product_data["description"],
                    price=product_data["price"],
                    stock=product_data["stock"],
                    category_id=product_data["category"].id_key
                )
                session.add(product)
                print(f"✅ Producto creado: {product.name}")

        session.commit()
        print("✅ Base de datos poblada con productos de ejemplo")

    except Exception as e:
        print(f"❌ Error poblando la base de datos: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    seed_products()
