from sqlmodel import SQLModel

from app.modules.usuarios.schemas import UserCreate, UserPublic

__all__ = ["UserCreate", "UserPublic", "MessageResponse"]


class MessageResponse(SQLModel):
    message: str
