"""Reglas de negocio de pedidos (RN-01 a RN-06)."""

from app.core.pagination import page_info, resolve_pagination
from app.core.utils import utcnow
from app.modules.pedidos.models import DetallePedido, EstadoPedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

# ---------------------------------------------------------------------------
# Excepciones de dominio (el Router las traduce a códigos HTTP)
# ---------------------------------------------------------------------------


class DominioError(Exception):
    """Base de las excepciones de dominio de pedidos."""


class PedidoNoEncontrado(DominioError):  # 404
    pass


class ProductoNoEncontrado(DominioError):  # 404
    pass


class PedidoAjeno(DominioError):  # 403
    pass


class ReglaDeNegocio(DominioError):  # 400
    pass


class StockInsuficiente(ReglaDeNegocio):
    pass


class ProductoNoDisponible(ReglaDeNegocio):
    pass


class ProductoRepetido(ReglaDeNegocio):
    pass


class TransicionInvalida(ReglaDeNegocio):
    pass


# ---------------------------------------------------------------------------
# RN-02: mapa de transiciones válidas
# ---------------------------------------------------------------------------

TRANSICIONES: dict[str, set[str]] = {
    EstadoPedido.PENDIENTE.value: {
        EstadoPedido.EN_PREPARACION.value,
        EstadoPedido.CANCELADO.value,
    },
    EstadoPedido.EN_PREPARACION.value: {
        EstadoPedido.ENTREGADO.value,
        EstadoPedido.CANCELADO.value,
    },
    EstadoPedido.ENTREGADO.value: set(),  # terminal
    EstadoPedido.CANCELADO.value: set(),  # terminal
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # -- helpers -----------------------------------------------------------

    @staticmethod
    def _get_pedido(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(f"Pedido {pedido_id} no encontrado")
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve al stock la cantidad de cada línea, en la misma transacción."""
        for linea in pedido.items:
            producto = uow.productos.get_by_id(linea.producto_id)
            if producto is not None:
                producto.stock += linea.cantidad
                uow.productos.add(producto)

    # -- RN-01: crear pedido -----------------------------------------------

    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido("Un producto no puede repetirse entre los ítems")

        with self.uow as uow:
            ahora = utcnow()
            pedido = Pedido(
                usuario_id=usuario_id,
                estado=EstadoPedido.PENDIENTE.value,
                forma_pago=data.forma_pago.value,  # RN-06 (validado en el schema)
                direccion_entrega=data.direccion_entrega,
                notas=data.notas or None,
                total=0.0,
                created_at=ahora,
                updated_at=ahora,
            )
            uow.pedidos.add(pedido)
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {item.producto_id} no encontrado"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no está disponible"
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': "
                        f"quedan {producto.stock} y se pidieron {item.cantidad}"
                    )

                # En la misma iteración: descuenta stock y crea la línea con la copia.
                producto.stock -= item.cantidad
                uow.productos.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            uow.pedidos.refresh(pedido)
            # Se arma el schema de salida DENTRO del bloque (la sesión sigue abierta).
            return PedidoRead.model_validate(pedido)

    # -- lecturas ----------------------------------------------------------

    def listar(
        self,
        usuario_id: int,
        es_admin: bool,
        skip: int,
        limit: int,
        page: int | None = None,
        size: int | None = None,
        estado: str | None = None,
    ) -> PedidosPaginados:
        """Un user ve solo los suyos; el admin ve todos (RN-04)."""
        skip, limit = resolve_pagination(skip, limit, page, size)
        with self.uow as uow:
            if es_admin:
                pedidos, total = uow.pedidos.list_all(estado, skip, limit)
            else:
                pedidos, total = uow.pedidos.list_by_usuario(
                    usuario_id, estado, skip, limit
                )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
                **page_info(total, skip, limit, page, size),
            )

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_del_dia = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=conteos.get(EstadoPedido.PENDIENTE.value, 0),
                en_preparacion=conteos.get(EstadoPedido.EN_PREPARACION.value, 0),
                entregados=conteos.get(EstadoPedido.ENTREGADO.value, 0),
                cancelados=conteos.get(EstadoPedido.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_del_dia),
                ingresos_entregados=uow.pedidos.sum_total_por_estado(
                    EstadoPedido.ENTREGADO.value
                ),
            )

    # -- RN-02 / RN-03: cambios de estado ------------------------------------

    def cambiar_estado(self, pedido_id: int, nuevo_estado: EstadoPedido) -> PedidoRead:
        """Uso del admin: avanza o cancela según el mapa de transiciones."""
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            destino = nuevo_estado.value
            if destino not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(
                    f"Transición inválida: {pedido.estado} → {destino}"
                )
            if destino == EstadoPedido.CANCELADO.value:
                self._restituir_stock(uow, pedido)
            pedido.estado = destino
            pedido.updated_at = utcnow()
            uow.pedidos.add(pedido)
            uow.pedidos.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """Cancelación del dueño (RN-04): solo sus pedidos y solo en PENDIENTE."""
        with self.uow as uow:
            pedido = self._get_pedido(uow, pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != EstadoPedido.PENDIENTE.value:
                raise TransicionInvalida(
                    "Solo se puede cancelar un pedido en estado PENDIENTE"
                )
            self._restituir_stock(uow, pedido)
            pedido.estado = EstadoPedido.CANCELADO.value
            pedido.updated_at = utcnow()
            uow.pedidos.add(pedido)
            uow.pedidos.refresh(pedido)
            return PedidoRead.model_validate(pedido)
