from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Listado, activación y desactivación (baja lógica) de usuarios.

    En este módulo se admite lanzar HTTPException desde el Service.
    """

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        """Idempotente: responde 200 aunque el usuario ya estuviera activo."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(
                    status.HTTP_404_NOT_FOUND, "Usuario no encontrado"
                )
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, actor_id: int) -> UserPublic:
        """Idempotente. Un admin no puede desactivarse a sí mismo (400)."""
        if usuario_id == actor_id:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                "Un administrador no puede desactivarse a sí mismo",
            )
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(
                    status.HTTP_404_NOT_FOUND, "Usuario no encontrado"
                )
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
