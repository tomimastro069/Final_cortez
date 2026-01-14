#!/usr/bin/env python3
"""
Seed script to create admin user.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal
from models.client import ClientModel
from services.client_service import ClientService
from schemas.client_schema import ClientSchema

def seed_admin():
    session = SessionLocal()

    try:
        exists = (
            session
            .query(ClientModel)
            .filter(ClientModel.email == "admin@techstore.com")
            .first()
        )

        if exists:
            print("✅ Admin ya existe")
            return

        admin_data = ClientSchema(
            name="Admin",
            lastname="TechStore",
            email="admin@techstore.com",
            telephone="+549123456789",
            password="admin123",
            is_admin=True
        )

        service = ClientService(session)
        admin = service.create(admin_data)

        session.commit()
        print(f"✅ Admin creado: {admin.email}")

    except Exception as e:
        session.rollback()
        print(f"❌ Error creando admin: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed_admin()
