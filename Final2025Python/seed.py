#!/usr/bin/env python3
"""
Seed script to populate the database with sample data.
Run this after starting the backend to add sample products and categories.
"""

from sqlalchemy.orm import Session
from config.database import get_db, create_tables
from models.category import CategoryModel
from models.product import ProductModel

def seed_database():
    """Add sample categories and products to the database."""
    db: Session = next(get_db())

    try:
        # Create categories
        categories_data = [
            {"name": "Electrónica"},
            {"name": "Ropa"},
            {"name": "Hogar"},
            {"name": "Deportes"},
            {"name": "Libros"}
        ]

        categories = []
        for cat_data in categories_data:
            category = CategoryModel(**cat_data)
            db.add(category)
            categories.append(category)

        db.commit()

        # Refresh to get IDs
        for cat in categories:
            db.refresh(cat)

        # Create products
        products_data = [
            {"name": "Laptop Gaming", "price": 1299.99, "stock": 10, "category_id": categories[0].id_key},
            {"name": "Smartphone", "price": 699.99, "stock": 25, "category_id": categories[0].id_key},
            {"name": "Auriculares Bluetooth", "price": 89.99, "stock": 50, "category_id": categories[0].id_key},
            {"name": "Camiseta Deportiva", "price": 29.99, "stock": 100, "category_id": categories[1].id_key},
            {"name": "Pantalones Jeans", "price": 59.99, "stock": 75, "category_id": categories[1].id_key},
            {"name": "Zapatillas Running", "price": 119.99, "stock": 40, "category_id": categories[1].id_key},
            {"name": "Sartén Antiadherente", "price": 34.99, "stock": 30, "category_id": categories[2].id_key},
            {"name": "Lámpara de Mesa", "price": 79.99, "stock": 20, "category_id": categories[2].id_key},
            {"name": "Pelota de Fútbol", "price": 24.99, "stock": 60, "category_id": categories[3].id_key},
            {"name": "Bicicleta de Montaña", "price": 499.99, "stock": 15, "category_id": categories[3].id_key},
            {"name": "Novela de Ciencia Ficción", "price": 19.99, "stock": 80, "category_id": categories[4].id_key},
            {"name": "Libro de Cocina", "price": 39.99, "stock": 35, "category_id": categories[4].id_key}
        ]

        for prod_data in products_data:
            product = ProductModel(**prod_data)
            db.add(product)

        db.commit()

        print("✅ Database seeded successfully!")
        print(f"Added {len(categories)} categories and {len(products_data)} products.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
    seed_database()
