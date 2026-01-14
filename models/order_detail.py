from sqlalchemy import Column, Float, ForeignKey, Integer, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from models.base_model import base


class OrderDetailModel(base):
    __tablename__ = "order_details"

    quantity = Column(Integer)
    price = Column(Float)
    order_id = Column(Integer, ForeignKey("orders.id_key"), index=True)
    product_id = Column(Integer, ForeignKey("products.id_key"), index=True)

    order = relationship("OrderModel", back_populates="order_details", lazy="select")
    product = relationship("ProductModel", back_populates="order_details", lazy="select")

    __table_args__ = (
        PrimaryKeyConstraint('order_id', 'product_id'),
    )
