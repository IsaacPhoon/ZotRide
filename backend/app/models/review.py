from datetime import datetime, timezone
from sqlalchemy import DateTime, Integer, ForeignKey, UniqueConstraint, String, Float, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models import DriverData, User, Ride

class Review(db.Model):
    __tablename__ = 'reviews'
    __table_args__ = (UniqueConstraint('ride_id', 'author_id'),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    driver_id: Mapped[int] = mapped_column(Integer, ForeignKey('driver_data.id'), nullable=False, index=True)
    driver: Mapped['DriverData'] = relationship('DriverData', back_populates='reviews')

    author_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    author: Mapped['User'] = relationship('User', back_populates='ratings_authored')

    ride_id: Mapped[int] = mapped_column(Integer, ForeignKey('rides.id'), nullable=False, index=True)
    ride: Mapped['Ride'] = relationship('Ride', back_populates='reviews')

    stars: Mapped[float] = mapped_column(Float, CheckConstraint('stars >= 0.5 AND stars <= 5'), nullable=False)
    comment: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __init__(
            self,
            driver_id: int,
            author_id: int,
            ride_id: int,
            stars: float,
            comment: str
        ):
        self.driver_id = driver_id
        self.author_id = author_id
        self.ride_id = ride_id
        self.stars = stars
        self.comment = comment

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'driver_id': self.driver_id,
            'author_id': self.author_id,
            'author_name': self.author.name,
            'ride_id': self.ride_id,
            'stars': self.stars,
            'comment': self.comment,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    def __repr__(self) -> str:
        return f'<Review(id={self.id}, stars={self.stars}, author_id={self.author_id}, ride_id={self.ride_id})>'