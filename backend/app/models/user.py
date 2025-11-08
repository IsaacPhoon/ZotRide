from typing import Optional
from sqlalchemy import String, Integer, Column, Table, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models import Ride, DriverData, UserOrganizationData

user_ride_association = Table(
    'user_ride_association',
    db.Model.metadata,
    Column('user_id', ForeignKey('users.id')),
    Column('ride_id', ForeignKey('rides.id')),
)

class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    # 0: Male, 1: Female, 2: Other
    gender: Mapped[int] = mapped_column(Integer, nullable=False)
    preferred_contact: Mapped[str] = mapped_column(String(100), nullable=False)
    driver_data: Mapped[Optional[DriverData]] =  relationship('DriverData', back_populates='user', cascade='all, delete-orphan', nullable=True)
    takenRides: Mapped[list[Ride]] = relationship(secondary=user_ride_association)
    organizations: Mapped[list[UserOrganizationData]] = relationship('UserOrganizationData', back_populates='user', cascade='all, delete-orphan')

    def __init__(self, email: str, name: str, gender: int, preferred_contact: str):
        self.email = email
        self.name = name
        self.gender = gender
        self.preferred_contact = preferred_contact

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'gender': self.gender,
            'preferred_contact': self.preferred_contact
        }

    def __repr__(self) -> str:
        return f'<User id={self.id} email={self.email} name={self.name}>'