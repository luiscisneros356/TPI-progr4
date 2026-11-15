"""Registro de modelos.

Importar este módulo declara los cinco modelos en el metadata de SQLModel y resuelve
las relaciones que se refieren entre sí por nombre (por ejemplo "Pedido" desde Usuario).
"""

from app.modules.categorias.models import Categoria  # noqa: F401
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401
from app.modules.productos.models import Producto  # noqa: F401
from app.modules.usuarios.models import Usuario  # noqa: F401
