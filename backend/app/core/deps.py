from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie

from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_NAME = "access_token"

# auto_error=False: la respuesta 401 la arma get_current_user con su propio detail.
cookie_scheme = APIKeyCookie(name=COOKIE_NAME, auto_error=False)


def get_current_user(token: str | None = Depends(cookie_scheme)) -> Usuario:
    """Lee la cookie HttpOnly, valida firma y expiración y carga el usuario."""
    unauthorized = HTTPException(
        status.HTTP_401_UNAUTHORIZED, "No autenticado o sesión expirada"
    )
    if not token:
        raise unauthorized
    payload = decode_access_token(token)
    if payload is None:
        raise unauthorized
    try:
        usuario_id = int(payload.get("sub", ""))
    except (TypeError, ValueError):
        raise unauthorized from None

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_id(usuario_id)
    if usuario is None:
        raise unauthorized
    return usuario


def get_current_active_user(
    usuario: Usuario = Depends(get_current_user),
) -> Usuario:
    """Rechaza (400) a los usuarios dados de baja lógica."""
    if usuario.disabled:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada"
        )
    return usuario


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    """Dependencia que exige que el rol del usuario esté en ``roles`` (403 si no)."""

    def checker(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "No tenés permisos para realizar esta acción",
            )
        return usuario

    return checker
