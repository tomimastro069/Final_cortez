#!/usr/bin/env python3
"""
Seed script to create admin user for production.
Usa DATABASE_URL en Render.
"""

import os
import sys

# Añadir path del proyecto para imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal
from models.client import ClientModel
from services.client_service import ClientService
from schemas.client_schema import ClientSchema


def seed_admin():
    # Revisar variable de entorno de producción
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("❌ DATABASE_URL no está configurada")

    session = SessionLocal()

    try:
        # Verificar si ya existe el admin
        exists = session.query(ClientModel).filter_by(email="admin@techstore.com").first()
        if exists:
            print("✅ Admin ya existe")
            return

        # Datos del admin
        admin_data = ClientSchema(
            name="Admin",
            lastname="TechStore",
            email="admin@techstore.com",
            telephone="+549123456789",
            password="admin123",
            is_admin=True
        )

        # Crear admin usando save
        service = ClientService(session)
        service.save(admin_data)

        session.commit()
        print("✅ Admin creado correctamente: admin@techstore.com")

    except Exception as e:
        session.rollback()
        print(f"❌ Error creando admin: {e}")

    finally:
        session.close()


if __name__ == "__main__":
    seed_admin()
