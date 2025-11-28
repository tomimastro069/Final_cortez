from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from repositories.base_repository_impl import BaseRepositoryImpl, InstanceNotFoundError
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
            service = self.service_factory(db)
            entity = service.get_by_id(id_key)
            if not entity:
                raise HTTPException(status_code=404, detail="Entidad no encontrada")
            return entity

        # GET todos
        @self.router.get("/", response_model=list[self.schema])
        async def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
            service = self.service_factory(db)
            return service.get_all(skip=skip, limit=limit)

        # POST crear
        @self.router.post("/", response_model=self.schema)
        async def create(entity: self.schema, db: Session = Depends(get_db)):
            service = self.service_factory(db)
            return service.create(entity)

        # PUT actualizar
        @self.router.put("/id/{id_key}", response_model=self.schema)
        async def update(id_key: int, entity: self.schema, db: Session = Depends(get_db)):
            service = self.service_factory(db)
            updated = service.update(id_key, entity)
            if not updated:
                raise HTTPException(status_code=404, detail="Entidad no encontrada")
            return updated

        # DELETE
        @self.router.delete("/id/{id_key}")
        async def delete(id_key: int, db: Session = Depends(get_db)):
            service = self.service_factory(db)
            deleted = service.delete(id_key)
            if not deleted:
                raise HTTPException(status_code=404, detail="Entidad no encontrada")
            return {"deleted": True}
