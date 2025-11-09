from datetime import datetime, timezone
from sqlalchemy import DateTime, String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models import UserOrganizationData, Ride

class Organization(db.Model):
    __tablename__ = 'organizations'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    members: Mapped[list['UserOrganizationData']] = relationship('UserOrganizationData', back_populates='organization', cascade='all, delete-orphan')
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    organization_rides: Mapped[list['Ride']] = relationship('Ride', back_populates='organization')

    access_code: Mapped[str] = mapped_column(String(6), unique=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __init__(self, name: str, description: Optional[str] = None):
        self.name = name
        self.description = description

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description if self.description else None,
            'organization_rides': [ride.id for ride in self.organization_rides],
            'access_code': self.access_code
        }

    def __repr__(self) -> str:
        return f'<Organization id={self.id} name={self.name}>'