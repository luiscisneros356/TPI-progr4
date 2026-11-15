from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import utcnow

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido

ROLE_USER = "user"
ROLE_ADMIN = "admin"


class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, max_length=50)
    full_name: str = Field(max_length=100)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str
    role: str = Field(default=ROLE_USER)
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utcnow)

    pedidos: List["Pedido"] = Relationship(back_populates="usuario")
