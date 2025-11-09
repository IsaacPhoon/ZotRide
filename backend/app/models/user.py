from datetime import datetime, timezone
from sqlalchemy import DateTime, String, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models import DriverData, UserOrganizationData, UserRideData, Review

class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_system_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # 0: Male, 1: Female, 2: Other
    gender: Mapped[int] = mapped_column(Integer, nullable=False)
    preferred_contact: Mapped[str] = mapped_column(String(100), nullable=False)
    driver_data: Mapped[Optional['DriverData']] =  relationship('DriverData', back_populates='user', cascade='all, delete-orphan')
    taken_rides: Mapped[list['UserRideData']] = relationship('UserRideData', back_populates='user', cascade='all, delete-orphan')
    organizations: Mapped[list['UserOrganizationData']] = relationship('UserOrganizationData', back_populates='user', cascade='all, delete-orphan')

    ratings_authored: Mapped[list['Review']] = relationship('Review', back_populates='author', cascade='all, delete-orphan')

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __init__(self, email: str, name: str, gender: int, preferred_contact: str, is_system_admin: bool = False):
        self.email = email
        self.name = name
        self.gender = gender
        self.preferred_contact = preferred_contact
        self.is_system_admin = is_system_admin

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'gender': self.gender,
            'preferred_contact': self.preferred_contact,
            'is_driver': self.driver_data is not None and self.driver_data.is_approved,
            'driver_id': self.driver_data.id if self.driver_data else None,
            'total_reviews_authored': len(self.ratings_authored),
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self) -> str:
        return f'<User id={self.id} email={self.email} name={self.name}>'