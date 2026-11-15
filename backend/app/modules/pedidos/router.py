from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.models import EstadoPedido
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    DominioError,
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import ROLE_ADMIN, Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _http_error(exc: DominioError) -> HTTPException:
    """Traduce una excepción de dominio al código HTTP de la especificación."""
    if isinstance(exc, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    if isinstance(exc, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(exc))
    # StockInsuficiente, ProductoNoDisponible, ProductoRepetido, TransicionInvalida...
    return HTTPException(status.HTTP_400_BAD_REQUEST, str(exc))


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crea el pedido desde el carrito (RN-01)",
)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    assert usuario.id is not None
    try:
        return service.crear(data, usuario_id=usuario.id)
    except DominioError as exc:
        raise _http_error(exc) from exc


@router.get(
    "",
    response_model=PedidosPaginados,
    summary="Propios (user) o todos (admin), paginados",
)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    page: int | None = Query(None, ge=1),
    size: int | None = Query(None, ge=1, le=100),
    estado: EstadoPedido | None = Query(None),
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    assert usuario.id is not None
    return service.listar(
        usuario_id=usuario.id,
        es_admin=usuario.role == ROLE_ADMIN,
        skip=skip,
        limit=limit,
        page=page,
        size=size,
        estado=estado.value if estado else None,
    )


# Se declara ANTES de /{pedido_id} para que "resumen" no se interprete como un id.
@router.get(
    "/resumen",
    response_model=ResumenPedidos,
    summary="Indicadores del panel de administración",
)
def resumen_pedidos(
    _: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return service.resumen()


@router.get(
    "/{pedido_id}",
    response_model=PedidoRead,
    summary="Detalle con sus líneas (dueño o admin)",
)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    assert usuario.id is not None
    try:
        return service.obtener(
            pedido_id, usuario_id=usuario.id, es_admin=usuario.role == ROLE_ADMIN
        )
    except DominioError as exc:
        raise _http_error(exc) from exc


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    summary="El admin avanza o cancela según la máquina de estados",
)
def cambiar_estado_pedido(
    pedido_id: int,
    data: CambioEstado,
    _: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except DominioError as exc:
        raise _http_error(exc) from exc


@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
    summary="El dueño cancela su pedido en PENDIENTE",
)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    assert usuario.id is not None
    try:
        return service.cancelar_propio(pedido_id, usuario_id=usuario.id)
    except DominioError as exc:
        raise _http_error(exc) from exc
