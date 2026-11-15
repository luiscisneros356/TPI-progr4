import math


def resolve_pagination(
    skip: int, limit: int, page: int | None, size: int | None
) -> tuple[int, int]:
    """Convierte page/size (opcionales) en skip/limit. Si no vienen, usa skip/limit."""
    if page is not None or size is not None:
        effective_size = size if size is not None else limit
        effective_page = page if page is not None else 1
        return (effective_page - 1) * effective_size, effective_size
    return skip, limit


def page_info(
    total: int, skip: int, limit: int, page: int | None, size: int | None
) -> dict[str, int | None]:
    """Datos extra (page, size, pages) cuando el cliente usa page/size."""
    if page is None and size is None:
        return {"page": None, "size": None, "pages": None}
    return {
        "page": skip // limit + 1 if limit else 1,
        "size": limit,
        "pages": math.ceil(total / limit) if limit else 0,
    }
