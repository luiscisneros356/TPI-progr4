from types import TracebackType
from typing import Callable

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Unit of Work base.

    - ``__enter__`` abre la sesión y arma los repositorios que la comparten.
    - ``__exit__`` hace commit si no hubo excepción, rollback si la hubo, y siempre close.

    Es el único lugar donde se llama a ``commit``: ningún Service ni Router lo hace.
    """

    def __init__(self, session_factory: Callable[[], Session] | None = None) -> None:
        self._session_factory = session_factory or default_session_factory
        self.session: Session | None = None

    def _init_repositories(self, session: Session) -> None:
        """Las subclases crean aquí sus repositorios sobre la misma sesión."""

    def __enter__(self) -> "UnitOfWork":
        self.session = self._session_factory()
        self._init_repositories(self.session)
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_value: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        session = self.session
        if session is None:
            return
        try:
            if exc_type is None:
                session.commit()
            else:
                session.rollback()
        finally:
            session.close()
            self.session = None
