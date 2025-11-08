from datetime import datetime, timezone
from sqlalchemy import DateTime, String, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models import User, Ride

class DriverData(db.Model):
    __tablename__ = 'driver_data'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    license_image: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    vehicle_data: Mapped[str] = mapped_column(String(255), nullable=False)
    license_plate: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, default=None, nullable=True)

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False, unique=True)
    user: Mapped['User'] = relationship('User', back_populates='driver_data')

    hosted_rides: Mapped[list['Ride']] = relationship('Ride', back_populates='driver', cascade='all, delete-orphan')

    def set_as_approved(self, approved: bool):
        self.is_approved = approved
        self.approved_at = datetime.now(timezone.utc)

    def __init__(self, license_image: str, vehicle_data: str, license_plate: str, is_approved: bool, user_id: int):
        self.license_image = license_image
        self.vehicle_data = vehicle_data
        self.license_plate = license_plate
        self.is_approved = is_approved
        self.user_id = user_id

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'license_image': self.license_image,
            'vehicle_data': self.vehicle_data,
            'license_plate': self.license_plate,
            'is_approved': self.is_approved,
            'approved_at': self.approved_at,
            'user_id': self.user_id,
            'hosted_rides': [ride.id for ride in self.hosted_rides]
        }

    def __repr__(self) -> str:
        return f"<DriverData id={self.id} license_plate={self.license_plate} is_approved={self.is_approved}>"