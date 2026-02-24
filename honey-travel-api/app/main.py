from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.data.seed_hotels import seed_hotels
from app.routes.hotels import router as hotels_router
from app.routes.bookings import router as bookings_router
from app.routes.webhooks import router as webhooks_router
from app.routes.admin import router as admin_router
from app.routes.admin_auth import router as admin_auth_router
from app.routes.admin_hotels import router as admin_hotels_router
from app.routes.admin_bookings import router as admin_bookings_router
from app.routes.admin_crm import router as admin_crm_router
from app.routes.admin_products import router as admin_products_router
from app.routes.admin_import_export import router as admin_import_export_router
from app.routes.admin_analytics import router as admin_analytics_router

# Import all models so they are registered with Base
import app.models.admin  # noqa
import app.models.product  # noqa
import app.models.payment_event  # noqa
import app.models.data_job  # noqa
import app.models.season  # noqa
import app.models.customer_timeline  # noqa


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_hotels()
    # Seed admin roles and default user
    from app.database import async_session
    from app.data.seed_admin import seed_admin
    async with async_session() as db:
        await seed_admin(db)
    yield


app = FastAPI(title="Honey Travel Istanbul Gateway API", lifespan=lifespan)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(hotels_router)
app.include_router(bookings_router)
app.include_router(webhooks_router)
app.include_router(admin_router)
app.include_router(admin_auth_router)
app.include_router(admin_hotels_router)
app.include_router(admin_bookings_router)
app.include_router(admin_crm_router)
app.include_router(admin_products_router)
app.include_router(admin_import_export_router)
app.include_router(admin_analytics_router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
