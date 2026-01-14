#!/usr/bin/env python3
"""
Minimal seed script to create admin user if missing.
Use DATABASE_URL in Render.
"""

import os
import sys
from sqlalchemy.orm import Session

# Añadir path del proyecto para imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal
from models.client import ClientModel
from services.client_service import ClientService
from schemas.client_schema import ClientSchema

def create_admin_if_missing():
    session: Session = SessionLocal()
    try:
        exists = session.query(ClientModel).filter_by(email="admin@techstore.com").first()
        if exists:
            print("✅ Admin already exists")
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
        service.save(admin_data)
        session.commit()
        print("✅ Admin created successfully: admin@techstore.com")

    except Exception as e:
        session.rollback()
        print(f"❌ Error creating admin: {e}")

    finally:
        session.close()

if __name__ == "__main__":
    create_admin_if_missing()
