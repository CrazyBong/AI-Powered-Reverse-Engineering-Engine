import logging
logging.basicConfig(level=logging.DEBUG)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.upload import router as upload_router
from app.api.status import router as status_router
from app.api.functions import router as functions_router
from app.api.explain import router as explain_router
from app.api.disassembly import router as disasm_router
from app.api.disassembly import cfg_router  # add this import


def create_app():
    app = FastAPI()

    # ------------------------------------
    # IMPORTANT: Allow frontend connection
    # ------------------------------------
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*",  # for development only
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(upload_router)
    app.include_router(status_router)
    app.include_router(functions_router)
    app.include_router(explain_router)
    app.include_router(disasm_router)
    app.include_router(cfg_router)  # register /cfg routes

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()