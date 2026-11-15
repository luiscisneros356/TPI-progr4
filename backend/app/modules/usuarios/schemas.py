from datetime import datetime

from pydantic import ConfigDict, EmailStr
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    # bcrypt solo considera los primeros 72 bytes: se limita el largo.
    password: str = Field(min_length=8, max_length=72)


class UserPublic(SQLModel):
    """Nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
