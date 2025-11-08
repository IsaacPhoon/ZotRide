from datetime import datetime, timezone
from sqlalchemy import DateTime, String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models import User, Ride

class UserRideData(db.Model):
    __tablename__ = 'user_ride_data'
    __table_args__ = (UniqueConstraint('user_id', 'ride_id'),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user: Mapped[User] = relationship('User', back_populates='taken_rides')
    user_id: Mapped[int] = mapped_column('user_id', ForeignKey('users.id'), nullable=False, index=True)
    ride: Mapped[Ride] = relationship('Ride', back_populates='riders')
    ride_id: Mapped[int] = mapped_column('ride_id', ForeignKey('rides.id'), nullable=False, index=True)
    user_comment: Mapped[Optional[str]] = mapped_column(String(500), default=None, nullable=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __init__(self, user_id, ride_id, user_comment: Optional[str] = None):
        self.user_id = user_id
        self.ride_id = ride_id
        self.user_comment = user_comment

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'ride_id': self.ride_id,
            'user_comment': self.user_comment
        }

    def __repr__(self) -> str:
        return f'<UserRideData id={self.id} user_id={self.user_id} ride_id={self.ride_id}>'