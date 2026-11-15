from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import ROLE_USER, Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """Registro público y autenticación. Usa el modelo Usuario.

    En este módulo se admite lanzar HTTPException desde el Service.
    """

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def register(self, data: UserCreate) -> UserPublic:
        """Crea un usuario con rol ``user`` (nunca admin desde el registro público)."""
        email = data.email.lower()
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise HTTPException(
                    status.HTTP_409_CONFLICT, "El nombre de usuario ya existe"
                )
            if uow.usuarios.get_by_email(email) is not None:
                raise HTTPException(
                    status.HTTP_409_CONFLICT, "El email ya está registrado"
                )
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=email,
                hashed_password=hash_password(data.password),
                role=ROLE_USER,
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        """Valida credenciales y devuelve el JWT (que el router guarda en la cookie)."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None and "@" in username:
                usuario = uow.usuarios.get_by_email(username.lower())
            if usuario is None or not verify_password(
                password, usuario.hashed_password
            ):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED, "Usuario o contraseña incorrectos"
                )
            if usuario.disabled:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada"
                )
            return create_access_token(subject=str(usuario.id))
