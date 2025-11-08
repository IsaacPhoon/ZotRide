from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models import DriverData, User, Organization, user_ride_association

class Ride(db.Model):
    __tablename__ = 'rides'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pickup_location: Mapped[str] = mapped_column(String(255), nullable=False)
    pickup_address: Mapped[str] = mapped_column(String(255), nullable=False)
    pickup_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    destination_location: Mapped[str] = mapped_column(String(255), nullable=False)
    destination_address: Mapped[str] = mapped_column(String(255), nullable=False)
    max_riders: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    price_option: Mapped[str] = mapped_column(String(31), default='free', nullable=False)
    # Possible values: 'free', 'gas', 'gas with fee'
    status: Mapped[str] = mapped_column(String(20), default='active', nullable=False)
    # Possible values: 'active', 'completed'

    driver_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('driver_data.id'), nullable=True, ondelete='RESTRICT')
    driver: Mapped[Optional['DriverData']] = relationship('DriverData', back_populates='hosted_rides')

    riders: Mapped[list['User']] = relationship(secondary=user_ride_association, back_populates='taken_rides')

    organization_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey('organizations.id'), nullable=True)
    organization: Mapped[Optional[Organization]] = relationship('Organization', back_populates='organization_rides')

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    @property
    def available_seats(self) -> int:
        return self.max_riders - len(self.riders)

    @property
    def is_full(self) -> bool:
        return len(self.riders) >= self.max_riders

    def __init__(
        self,
        pickup_location: str,
        pickup_address: str,
        pickup_time: datetime,
        destination_location: str,
        destination_address: str,
        max_riders: int,
        price_option: str,
        driver_id: Optional[int] = None,
        organization_id: Optional[int] = None
        ):
        self.pickup_location = pickup_location
        self.pickup_address = pickup_address
        self.pickup_time = pickup_time
        self.destination_location = destination_location
        self.destination_address = destination_address
        self.max_riders = max_riders
        self.price_option = price_option
        self.driver_id = driver_id
        self.organization_id = organization_id

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
            'driver_id': self.driver_id if self.driver_id else None,
            'riders': [rider.id for rider in self.riders]
        }

    def __repr__(self) -> str:
        return f'<Ride id={self.id} pickup_location={self.pickup_location} destination_location={self.destination_location} pickup_time={self.pickup_time}>'