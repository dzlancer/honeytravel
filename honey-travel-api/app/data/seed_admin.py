"""Seed default admin roles and super admin user."""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.admin import AdminUser, AdminRole
from app.services.auth import hash_password


DEFAULT_ROLES = [
    {
        "name": "super_admin",
        "description": "Full access to all features",
        "permissions": ["*"],
    },
    {
        "name": "hotel_manager",
        "description": "Manage hotels, pricing, offers",
        "permissions": [
            "hotels.read", "hotels.write",
            "pricing.read", "pricing.write",
            "bookings.read", "bookings.write",
            "import_export.read", "import_export.write",
            "products.read", "products.write",
        ],
    },
    {
        "name": "crm_agent",
        "description": "Manage customers and bookings",
        "permissions": [
            "hotels.read",
            "bookings.read", "bookings.write",
            "crm.read", "crm.write",
            "products.read",
        ],
    },
    {
        "name": "analyst",
        "description": "View-only access to analytics and reports",
        "permissions": [
            "hotels.read",
            "bookings.read",
            "crm.read",
            "analytics.read",
            "import_export.read",
        ],
    },
]


async def seed_admin(db: AsyncSession):
    """Seed admin roles and default super admin user."""
    # Seed roles
    for role_data in DEFAULT_ROLES:
        existing = (await db.execute(
            select(AdminRole).where(AdminRole.name == role_data["name"])
        )).scalar_one_or_none()
        if not existing:
            role = AdminRole(
                name=role_data["name"],
                description=role_data["description"],
                permissions=role_data["permissions"],
            )
            db.add(role)

    await db.flush()

    # Seed default super admin
    admin_email = "admin@honeytravelcheraga.com"
    existing_admin = (await db.execute(
        select(AdminUser).where(AdminUser.email == admin_email)
    )).scalar_one_or_none()

    if not existing_admin:
        super_role = (await db.execute(
            select(AdminRole).where(AdminRole.name == "super_admin")
        )).scalar_one_or_none()

        if super_role:
            admin = AdminUser(
                email=admin_email,
                password_hash=hash_password("HoneyTravel2026!"),
                full_name="Super Admin",
                role_id=super_role.id,
                is_active=True,
            )
            db.add(admin)

    await db.commit()
