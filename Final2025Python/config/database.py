import os
import logging
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from models.base_model import base
from models.address import AddressModel
from models.bill import BillModel
from models.category import CategoryModel
from models.client import ClientModel
from models.order import OrderModel
from models.order_detail import OrderDetailModel
from models.product import ProductModel
from models.review import ReviewModel

logger = logging.getLogger(__name__)

# Load .env in local dev (Render NO usa .env, usa sus env vars)
env_path = os.path.join(os.path.dirname(__file__), '../.env')
load_dotenv(env_path)

# The ONLY DB variable we use
DATABASE_URI = os.getenv("DATABASE_URL")
if not DATABASE_URI:
    raise ValueError("DATABASE_URL is not set!")

# Pool settings (optional but good)
POOL_SIZE = int(os.getenv('DB_POOL_SIZE', '50'))
MAX_OVERFLOW = int(os.getenv('DB_MAX_OVERFLOW', '100'))
POOL_TIMEOUT = int(os.getenv('DB_POOL_TIMEOUT', '10'))
POOL_RECYCLE = int(os.getenv('DB_POOL_RECYCLE', '3600'))

# Create engine
engine = create_engine(
    DATABASE_URI,
    pool_pre_ping=True,
    pool_size=POOL_SIZE,
    max_overflow=MAX_OVERFLOW,
    pool_timeout=POOL_TIMEOUT,
    pool_recycle=POOL_RECYCLE,
    echo=False,
    future=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    try:
        base.metadata.create_all(engine)
        logger.info("Tables created successfully.")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        raise

def drop_database():
    try:
        base.metadata.drop_all(engine)
        logger.info("Tables dropped successfully.")
    except Exception as e:
        logger.error(f"Error dropping tables: {e}")
        raise

def check_connection() -> bool:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection established.")
        return True
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        return False
