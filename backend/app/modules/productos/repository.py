from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        nombre: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[list[Producto], int]:
        """Productos activos filtrados y paginados. Devuelve (items, total)."""
        condiciones = [col(Producto.activo).is_(True)]
        if nombre:
            patron = (
                nombre.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
            )
            condiciones.append(
                func.lower(col(Producto.nombre)).like(
                    f"%{patron.lower()}%", escape="\\"
                )
            )
        if categoria_id is not None:
            condiciones.append(col(Producto.categoria_id) == categoria_id)
        if disponible is not None:
            condiciones.append(col(Producto.disponible).is_(disponible))

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*condiciones)
        ).one()
        items = self.session.exec(
            select(Producto)
            .where(*condiciones)
            .order_by(col(Producto.nombre), col(Producto.id))
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), int(total)
