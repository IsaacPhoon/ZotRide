from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models import DriverData, User, user_ride_association

class Ride(db.Model):
    __tablename__ = 'rides'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pickup_location: Mapped[str] = mapped_column(String(255), nullable=False)
    pickup_address: Mapped[str] = mapped_column(String(255), nullable=False)
    pickup_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    destination_location: Mapped[str] = mapped_column(String(255), nullable=False)
    destination_address: Mapped[str] = mapped_column(String(255), nullable=False)
    max_riders: Mapped[int] = mapped_column(Integer, default=4, nullable=True)
    # price_option will represent price tiers: 'free', 'gas', 'gas with fee'
    price_option: Mapped[str] = mapped_column(String, default='free', nullable=False)

    driver_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('driver_data.id'), nullable=False, ondelete='RESTRICT')
    driver: Mapped['DriverData'] = relationship('DriverData', back_populates='hosted_rides')

    riders: Mapped[list['User']] = relationship(secondary=user_ride_association)

    def __init__(
        self,
        pickup_location: str,
        pickup_address: str,
        pickup_time: datetime,
        destination_location: str,
        destination_address: str,
        max_riders: int,
        price_option: str,
        driver_id: int
        ):
        self.pickup_location = pickup_location
        self.pickup_address = pickup_address
        self.pickup_time = pickup_time
        self.destination_location = destination_location
        self.destination_address = destination_address
        self.max_riders = max_riders
        self.price_option = price_option
        self.driver_id = driver_id

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'pickup_location': self.pickup_location,
            'pickup_address': self.pickup_address,
            'pickup_time': self.pickup_time.isoformat(),
            'destination_location': self.destination_location,
            'destination_address': self.destination_address,
            'max_riders': self.max_riders,
            'price_option': self.price_option,
            'driver_id': self.driver_id,
            'riders': [rider.id for rider in self.riders]
        }

    def __repr__(self) -> str:
        return f'<Ride id={self.id} pickup_location={self.pickup_location} destination_location={self.destination_location} pickup_time={self.pickup_time}>'