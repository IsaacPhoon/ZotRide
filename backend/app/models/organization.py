from typing import Optional
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models import UserOrganizationData, Ride

class Organization(db.Model):
    table_name = 'organizations'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    members: Mapped[list[UserOrganizationData]] = relationship('UserOrganizationData', back_populates='organization', index=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    organization_rides: Mapped[list[Ride]] = relationship('Ride', pack_populates='organization')

    def __init__(self, name: str, description: Optional[str] = None):
        self.name = name
        self.description = description

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'organization_rides': [ride.id for ride in self.organization_rides]
        }

    def __repr__(self) -> str:
        return f'<Organization id={self.id} name={self.name}>'