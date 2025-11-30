from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from repositories.base_repository_impl import InstanceNotFoundError
from typing import Type, Callable

class BaseControllerImpl:
    """
    Controlador genérico base para CRUD de cualquier entidad.
    Recibe schema y service_factory como parámetros.
    """

    def __init__(self, schema: Type, service_factory: Callable, tags=None):
        self.schema = schema
        self.service_factory = service_factory
        self.tags = tags or []
        self.router = APIRouter()
        self._register_routes()

    def _register_routes(self):
        # GET por ID
        @self.router.get("/id/{id_key}", response_model=self.schema)
        async def get_by_id(id_key: int, db: Session = Depends(get_db)):
            try:
                service = self.service_factory(db)
                entity = service.get_by_id(id_key)
                return entity
            except InstanceNotFoundError:
                raise HTTPException(status_code=404, detail=f"Producto con ID {id_key} no encontrado")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

        # GET todos
        @self.router.get("/", response_model=list[self.schema])
        async def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
            try:
                service = self.service_factory(db)
                return service.get_all(skip=skip, limit=limit)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error al obtener entidades: {str(e)}")

        # POST crear
        @self.router.post("/", response_model=self.schema)
        async def create(entity: self.schema, db: Session = Depends(get_db)):
            try:
                service = self.service_factory(db)
                return service.create(entity)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error al crear: {str(e)}")

        # PUT actualizar
        @self.router.put("/id/{id_key}", response_model=self.schema)
        async def update(id_key: int, entity: self.schema, db: Session = Depends(get_db)):
            try:
                service = self.service_factory(db)
                return service.update(id_key, entity)
            except InstanceNotFoundError:
                raise HTTPException(status_code=404, detail=f"Entidad con ID {id_key} no encontrada")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error al actualizar: {str(e)}")

        # DELETE
        @self.router.delete("/id/{id_key}")
        async def delete(id_key: int, db: Session = Depends(get_db)):
            try:
                service = self.service_factory(db)
                service.delete(id_key)
                return {"deleted": True}
            except InstanceNotFoundError:
                raise HTTPException(status_code=404, detail=f"Entidad con ID {id_key} no encontrada")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error al eliminar: {str(e)}")