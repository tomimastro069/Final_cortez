#!/usr/bin/env python3
"""
Seed script to populate the database with sample products for testing.
Usa DATABASE_URL para producción.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal
from models.product import ProductModel
from models.category import CategoryModel

def seed_products():
    # Revisar variable de entorno de producción
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("❌ DATABASE_URL no está configurada")

    session = SessionLocal()

    try:
        # ---------- CATEGORIES ----------
        category_names = ["Laptops", "Smartphones", "Tablets", "Accesorios"]
        categories = {}

        for name in category_names:
            category = session.query(CategoryModel).filter_by(name=name).first()
            if not category:
                category = CategoryModel(name=name)
                session.add(category)
                session.flush()  # obtiene id sin commit
            categories[name] = category

        # ---------- PRODUCTS ----------
        products_data = [
            ("Laptop ASUS ROG", 2500.00, 10, "Laptops"),
            ("iPhone 15 Pro", 1200.00, 15, "Smartphones"),
            ("MacBook Air M3", 1800.00, 8, "Laptops"),
            ("Samsung Galaxy S24", 1000.00, 20, "Smartphones"),
            ("iPad Pro 12.9", 1500.00, 12, "Tablets"),
            ("Mouse Logitech MX Master", 120.00, 25, "Accesorios"),
            ("Teclado Mecánico RGB", 180.00, 18, "Accesorios"),
            ("Samsung Galaxy Tab S9", 900.00, 14, "Tablets"),
            ("Lenovo Legion 5", 1700.00, 10, "Laptops"),
            ("Dell XPS 13", 1600.00, 7, "Laptops"),
            ("Xiaomi 14 Pro", 950.00, 22, "Smartphones"),
            ("Motorola Edge 50", 780.00, 18, "Smartphones"),
            ("iPad Air M2", 1100.00, 9, "Tablets"),
            ("Amazon Fire HD 10", 250.00, 30, "Tablets"),
            ("Auriculares Sony WH-1000XM5", 420.00, 16, "Accesorios"),
            ("Cargador GaN 65W", 60.00, 40, "Accesorios"),
            ("Monitor LG UltraGear 27''", 350.00, 11, "Accesorios"),
            ("SSD Samsung 990 Pro 2TB", 220.00, 25, "Accesorios"),
        ]

        for name, price, stock, category_name in products_data:
            exists = session.query(ProductModel).filter_by(name=name).first()
            if exists:
                continue

            product = ProductModel(
                name=name,
                price=price,
                stock=stock,
                category_id=categories[category_name].id_key
            )

            session.add(product)
            print(f"✅ Producto creado: {name}")

        session.commit()
        print("✅ Base de datos poblada correctamente")

    except Exception as e:
        session.rollback()
        print(f"❌ Error poblando la base de datos: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    seed_products()
