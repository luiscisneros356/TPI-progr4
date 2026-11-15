"""Carga inicial: usuario admin, categorías y productos.

Es idempotente: se puede ejecutar varias veces sin duplicar datos.

    python -m app.db.seed
"""

from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import ROLE_ADMIN, Usuario

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"
ADMIN_EMAIL = "admin@foodstore.com"

IMG = "https://placehold.co/600x400/f97316/ffffff/png?text="

CATEGORIAS: list[dict[str, str]] = [
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas artesanales con papas"},
    {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra, porción o entera"},
    {"nombre": "Bebidas", "descripcion": "Gaseosas, jugos y agua"},
    {"nombre": "Postres", "descripcion": "Dulces para cerrar la comida"},
]

# (categoría, nombre, descripción, precio, stock)
PRODUCTOS: list[tuple[str, str, str, float, int]] = [
    ("Hamburguesas", "Hamburguesa clásica", "Carne, lechuga, tomate y queso", 5500.0, 30),
    ("Hamburguesas", "Hamburguesa doble cheddar", "Doble carne y doble cheddar", 7200.0, 25),
    ("Hamburguesas", "Hamburguesa veggie", "Medallón de lentejas y vegetales", 6300.0, 20),
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate y muzzarella", 8000.0, 15),
    ("Pizzas", "Pizza napolitana", "Muzzarella, tomate fresco y ajo", 9200.0, 12),
    ("Bebidas", "Gaseosa cola 500 ml", "Botella individual bien fría", 1800.0, 60),
    ("Bebidas", "Agua mineral 500 ml", "Sin gas", 1200.0, 80),
    ("Bebidas", "Limonada casera 400 ml", "Con menta y jengibre", 2400.0, 40),
    ("Postres", "Flan casero", "Con dulce de leche y crema", 3200.0, 18),
    ("Postres", "Brownie con helado", "Brownie tibio y bola de crema americana", 4500.0, 14),
    ("Postres", "Tiramisú", "Receta clásica italiana", 4800.0, 10),
    ("Pizzas", "Fugazzeta", "Cebolla caramelizada y muzzarella", 9500.0, 10),
]


def seed() -> None:
    create_all_tables()
    session = session_factory()
    try:
        # -- Admin -----------------------------------------------------------
        admin = session.exec(
            select(Usuario).where(Usuario.username == ADMIN_USERNAME)
        ).first()
        if admin is None:
            session.add(
                Usuario(
                    username=ADMIN_USERNAME,
                    full_name="Admin Food Store",
                    email=ADMIN_EMAIL,
                    hashed_password=hash_password(ADMIN_PASSWORD),
                    role=ROLE_ADMIN,
                )
            )
            print(f"Usuario admin creado ({ADMIN_USERNAME} / {ADMIN_PASSWORD})")
        else:
            print("Usuario admin ya existe")

        # -- Categorías --------------------------------------------------------
        por_nombre: dict[str, Categoria] = {}
        for datos in CATEGORIAS:
            categoria = session.exec(
                select(Categoria).where(Categoria.nombre == datos["nombre"])
            ).first()
            if categoria is None:
                categoria = Categoria(**datos)
                session.add(categoria)
                session.flush()
                print(f"Categoría creada: {datos['nombre']}")
            por_nombre[datos["nombre"]] = categoria

        # -- Productos ---------------------------------------------------------
        creados = 0
        for cat_nombre, nombre, descripcion, precio, stock in PRODUCTOS:
            categoria = por_nombre[cat_nombre]
            existe = session.exec(
                select(Producto).where(
                    Producto.nombre == nombre, Producto.categoria_id == categoria.id
                )
            ).first()
            if existe is None:
                assert categoria.id is not None
                session.add(
                    Producto(
                        categoria_id=categoria.id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=IMG + nombre.replace(" ", "+"),
                        stock=stock,
                    )
                )
                creados += 1
        print(f"Productos creados: {creados}")

        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
    print("Seed completo.")


if __name__ == "__main__":
    seed()
