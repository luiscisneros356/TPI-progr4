from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        """Agrega una línea al pedido (las líneas se crean una sola vez)."""
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def _listar(
        self,
        usuario_id: int | None,
        estado: str | None,
        skip: int,
        limit: int,
    ) -> tuple[list[Pedido], int]:
        condiciones = []
        if usuario_id is not None:
            condiciones.append(col(Pedido.usuario_id) == usuario_id)
        if estado is not None:
            condiciones.append(col(Pedido.estado) == estado)

        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*condiciones)
        ).one()
        pedidos = self.session.exec(
            select(Pedido)
            .where(*condiciones)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(pedidos), int(total)

    def list_by_usuario(
        self, usuario_id: int, estado: str | None, skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        """Pedidos de un usuario, del más nuevo al más viejo. Devuelve (items, total)."""
        return self._listar(usuario_id, estado, skip, limit)

    def list_all(
        self, estado: str | None, skip: int, limit: int
    ) -> tuple[list[Pedido], int]:
        """Todos los pedidos (vista del admin). Devuelve (items, total)."""
        return self._listar(None, estado, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(
            select(col(Pedido.estado), func.count()).group_by(col(Pedido.estado))
        ).all()
        return {estado: int(cantidad) for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return int(
            self.session.exec(
                select(func.count())
                .select_from(Pedido)
                .where(col(Pedido.created_at) >= desde)
            ).one()
        )

    def sum_total_por_estado(self, estado: str) -> float:
        suma = self.session.exec(
            select(func.coalesce(func.sum(col(Pedido.total)), 0.0)).where(
                col(Pedido.estado) == estado
            )
        ).one()
        return float(suma)
