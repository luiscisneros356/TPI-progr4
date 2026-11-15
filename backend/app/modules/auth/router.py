from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.core.deps import COOKIE_NAME, get_current_active_user
from app.modules.auth.schemas import MessageResponse, UserCreate, UserPublic
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Registro público (rol user)",
)
def register(
    data: UserCreate, service: AuthService = Depends(get_auth_service)
) -> UserPublic:
    try:
        return service.register(data)
    except IntegrityError:
        # Carrera entre dos registros simultáneos con el mismo username/email.
        raise HTTPException(
            status.HTTP_409_CONFLICT, "El usuario o el email ya existen"
        ) from None


@router.post(
    "/token",
    response_model=MessageResponse,
    summary="Login con formulario OAuth2; el JWT viaja en la cookie HttpOnly",
)
def login(
    response: Response,
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    token = service.login(form.username.strip(), form.password)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    # El token NO va en el cuerpo: solo en la cookie.
    return MessageResponse(message="Login exitoso")


@router.post("/logout", response_model=MessageResponse, summary="Borra la cookie")
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return MessageResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic, summary="Usuario autenticado")
def me(usuario: Usuario = Depends(get_current_active_user)) -> UserPublic:
    return UserPublic.model_validate(usuario)
