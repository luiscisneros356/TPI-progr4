from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


def _build_engine() -> Engine:
    if settings.DATABASE_URL.startswith("sqlite"):
        return create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False},
        )
    return create_engine(settings.DATABASE_URL, pool_pre_ping=True)


engine = _build_engine()


def create_all_tables() -> None:
    """Crea las tablas de los cinco modelos si no existen."""
    # Importar el registro garantiza que todos los modelos estén declarados.
    from app.db import base  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Crea una sesión nueva. Los objetos siguen legibles tras el commit."""
    return Session(engine, expire_on_commit=False)
