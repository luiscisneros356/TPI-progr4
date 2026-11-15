# Food Store — TPI Programación 3 (UTN)

Sistema de pedidos online para una tienda de comida.
Backend **FastAPI + SQLModel** (arquitectura por capas con Unit of Work) y frontend **React + TypeScript**.

- **Repositorio público:** <https://github.com/luiscisneros356/TPI-progr4>
- **Video de demostración (10–15 min):** `<COMPLETAR: link al video>`

## Requisitos

| Herramienta | Versión recomendada |
|---|---|
| Python | 3.11 o superior |
| Node.js | 20 o superior |
| pnpm | 10 (`npm i -g pnpm`) |
| PostgreSQL | 14 o superior (opcional: se puede usar SQLite en desarrollo) |

## Estructura

```
foodstore/
├── backend/    # API REST (FastAPI, SQLModel)
│   └── app/{core,db,modules/{auth,usuarios,categorias,productos,pedidos}}
└── frontend/   # SPA (React, Vite, Tailwind, TanStack)
    └── src/{features,shared,store,routes}
```

Flujo de capas del backend: `Router → Service → UnitOfWork → Repository → Model/Schemas`.
El commit/rollback ocurre únicamente en el `__exit__` del Unit of Work.

## Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # y editar los valores
```

### Variables de entorno (`backend/.env`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Ej. `postgresql://usuario:clave@localhost:5432/foodstore`. Para desarrollo rápido: `sqlite:///./foodstore.db` |
| `SECRET_KEY` | Clave para firmar los JWT. Generar una con `openssl rand -hex 32` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Vigencia del token (30) |
| `FRONTEND_ORIGIN` | Origen permitido por CORS (`http://localhost:5173`) |
| `COOKIE_SECURE` | `true` en producción con HTTPS |

Con PostgreSQL, crear antes la base: `createdb foodstore`.

### Datos iniciales (seed, idempotente)

```bash
python -m app.db.seed
```

Crea las tablas y carga 4 categorías, 12 productos y el usuario administrador:

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | ADMIN |

Se puede ejecutar varias veces sin duplicar datos. **Cambiar la contraseña fuera de desarrollo.**

### Ejecutar

```bash
uvicorn app.main:app --reload --port 8000
```

- API: <http://localhost:8000/api/v1>
- Swagger: <http://localhost:8000/docs> · ReDoc: <http://localhost:8000/redoc>

## Frontend

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (`http://localhost:8000/api/v1`) |

App en <http://localhost:5173>. Build de producción: `pnpm build`.

## Funcionalidades

- Registro/login con JWT en cookie **HttpOnly** (el token nunca queda en `localStorage`).
- Roles `CLIENT` y `ADMIN`; rutas protegidas en frontend y backend (401/403).
- Catálogo con búsqueda, filtro por categoría y paginación del lado del servidor.
- Carrito persistente (Zustand) y checkout con forma de pago y dirección.
- Creación de pedido **transaccional**: valida stock, lo descuenta y copia nombre/precio en cada línea (RN-01..RN-06).
- Máquina de estados `PENDIENTE → EN_PREPARACION → ENTREGADO`, cancelación con restitución de stock; `CANCELADO` y `ENTREGADO` son terminales.
- El cliente ve y cancela solo sus pedidos (mientras estén pendientes); el admin gestiona todos.
- Panel admin: productos (ABM, stock), categorías, usuarios (activar/desactivar), pedidos y resumen.
- Baja lógica en todas las entidades.

## Notas

- Las imágenes de ejemplo usan `placehold.co`; requieren conexión a internet.
- "Pedidos de hoy" del resumen cuenta desde las 00:00 UTC.
