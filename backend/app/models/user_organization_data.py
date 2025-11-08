from sqlalchemy import Boolean, Integer, UniqueConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.extensions import db
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models import User, Organization

class UserOrganizationData(db.Model):
    __tablename__ = 'user_organization_data'
    __table_args__ = (UniqueConstraint('user_id', 'organization_id'))

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user: Mapped[User] = relationship('User', back_populates='organizations')
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    organization: Mapped[Organization] = relationship('Organization', back_populates='members')
    organization_id: Mapped[int] = mapped_column(Integer, ForeignKey('organizations.id'), nullable=False)
    is_owner: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_driver: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    def __init__(self, user_id: int, organization_id: int, is_owner: bool = False, is_admin: bool = False, is_driver: bool = False):
        self.user_id = user_id
        self.organization_id = organization_id
        self.is_owner = is_owner
        self.is_admin = is_admin
        self.is_driver = is_driver

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'organization_id': self.organization_id,
            'is_owner': self.is_owner,
            'is_admin': self.is_admin,
            'is_driver': self.is_driver
        }

    def __repr__(self) -> str:
        return f'<UserOrganizationData id={self.id} user_id={self.user_id} organization_id={self.organization_id} is_owner={self.is_owner} is_admin={self.is_admin} is_driver={self.is_driver}>'