"""Admin authentication routes: login, MFA, password reset, user management."""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.admin import AdminUser, AdminRole, AdminPasswordResetToken, AdminMfaRecoveryCode, AdminAuditLog
from app.services.auth import (
    hash_password, verify_password, create_access_token, decode_access_token,
    generate_mfa_secret, get_mfa_provisioning_uri, verify_mfa_code,
    generate_recovery_codes, hash_token, generate_reset_token,
)

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])


# --- Dependency: get current admin user from JWT ---
async def get_current_admin(request: Request, db: AsyncSession = Depends(get_db)) -> AdminUser:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    user = (await db.execute(select(AdminUser).where(AdminUser.id == int(user_id)))).scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


def require_permission(permission_key: str):
    """Factory for permission-checking dependency."""
    async def checker(current_user: AdminUser = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
        role = (await db.execute(select(AdminRole).where(AdminRole.id == current_user.role_id))).scalar_one_or_none()
        if not role:
            raise HTTPException(status_code=403, detail="No role assigned")
        perms = role.permissions or []
        if "*" in perms or permission_key in perms:
            return current_user
        raise HTTPException(status_code=403, detail=f"Missing permission: {permission_key}")
    return checker


# --- Pydantic models ---
class LoginRequest(BaseModel):
    email: str
    password: str
    mfa_code: Optional[str] = None


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    role_id: int


class MfaSetupRequest(BaseModel):
    pass


class MfaVerifyRequest(BaseModel):
    code: str


class PasswordResetRequest(BaseModel):
    email: str


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UpdateAdminUserRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None


# --- Routes ---

@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Admin login with optional MFA."""
    user = (await db.execute(select(AdminUser).where(AdminUser.email == req.email))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Check lockout
    if user.lockout_until and user.lockout_until > datetime.utcnow():
        raise HTTPException(status_code=423, detail="Account locked. Try again later.")

    if not verify_password(req.password, user.password_hash):
        user.failed_login_count = (user.failed_login_count or 0) + 1
        if user.failed_login_count >= 5:
            user.lockout_until = datetime.utcnow() + timedelta(minutes=15)
        await db.commit()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")

    # MFA check
    if user.mfa_enabled and user.mfa_secret_encrypted:
        if not req.mfa_code:
            return {"mfa_required": True, "message": "MFA code required"}
        if not verify_mfa_code(user.mfa_secret_encrypted, req.mfa_code):
            raise HTTPException(status_code=401, detail="Invalid MFA code")

    # Success - reset counters
    user.failed_login_count = 0
    user.lockout_until = None
    user.last_login_at = datetime.utcnow()
    await db.commit()

    # Get role
    role = (await db.execute(select(AdminRole).where(AdminRole.id == user.role_id))).scalar_one_or_none()

    token = create_access_token({"sub": str(user.id), "email": user.email, "role": role.name if role else "unknown"})

    # Audit log
    log = AdminAuditLog(actor_id=user.id, actor_email=user.email, action="login", entity_type="admin_user", entity_id=str(user.id))
    db.add(log)
    await db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict(),
        "permissions": role.permissions if role else [],
    }


@router.get("/me")
async def get_me(current_user: AdminUser = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    """Get current admin user profile."""
    role = (await db.execute(select(AdminRole).where(AdminRole.id == current_user.role_id))).scalar_one_or_none()
    return {
        "user": current_user.to_dict(),
        "permissions": role.permissions if role else [],
    }


@router.post("/mfa/setup")
async def mfa_setup(current_user: AdminUser = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    """Generate MFA secret and provisioning URI."""
    secret = generate_mfa_secret()
    uri = get_mfa_provisioning_uri(secret, current_user.email)
    # Store secret temporarily (not yet enabled)
    current_user.mfa_secret_encrypted = secret
    await db.commit()
    return {"secret": secret, "provisioning_uri": uri}


@router.post("/mfa/verify")
async def mfa_verify(req: MfaVerifyRequest, current_user: AdminUser = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    """Verify MFA code and enable MFA."""
    if not current_user.mfa_secret_encrypted:
        raise HTTPException(status_code=400, detail="MFA not set up yet")
    if not verify_mfa_code(current_user.mfa_secret_encrypted, req.code):
        raise HTTPException(status_code=400, detail="Invalid MFA code")

    current_user.mfa_enabled = True
    current_user.mfa_verified_at = datetime.utcnow()

    # Generate recovery codes
    codes = generate_recovery_codes()
    for code in codes:
        db.add(AdminMfaRecoveryCode(admin_user_id=current_user.id, code_hash=hash_token(code)))

    await db.commit()
    return {"mfa_enabled": True, "recovery_codes": codes}


@router.post("/mfa/disable")
async def mfa_disable(req: MfaVerifyRequest, current_user: AdminUser = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    """Disable MFA (requires current MFA code)."""
    if not current_user.mfa_secret_encrypted:
        raise HTTPException(status_code=400, detail="MFA not enabled")
    if not verify_mfa_code(current_user.mfa_secret_encrypted, req.code):
        raise HTTPException(status_code=400, detail="Invalid MFA code")
    current_user.mfa_enabled = False
    current_user.mfa_secret_encrypted = None
    current_user.mfa_verified_at = None
    await db.commit()
    return {"mfa_enabled": False}


@router.post("/password/change")
async def change_password(req: ChangePasswordRequest, current_user: AdminUser = Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    """Change own password."""
    if not verify_password(req.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = hash_password(req.new_password)
    current_user.password_updated_at = datetime.utcnow()
    await db.commit()
    return {"success": True}


@router.post("/password/reset-request")
async def request_password_reset(req: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """Request password reset (sends email to contact@honeytravelcheraga.com)."""
    user = (await db.execute(select(AdminUser).where(AdminUser.email == req.email))).scalar_one_or_none()
    # Always return success to prevent email enumeration
    if user:
        token = generate_reset_token()
        reset = AdminPasswordResetToken(
            admin_user_id=user.id,
            token_hash=hash_token(token),
            expires_at=datetime.utcnow() + timedelta(hours=1),
        )
        db.add(reset)
        await db.commit()
        # In production, send email to contact@honeytravelcheraga.com
        # For now, return token (would be emailed)
    return {"message": "If that email exists, a reset link has been sent to contact@honeytravelcheraga.com"}


@router.post("/password/reset-confirm")
async def confirm_password_reset(req: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    """Confirm password reset with token."""
    token_hash = hash_token(req.token)
    reset = (await db.execute(
        select(AdminPasswordResetToken).where(
            AdminPasswordResetToken.token_hash == token_hash,
            AdminPasswordResetToken.used_at.is_(None),
            AdminPasswordResetToken.expires_at > datetime.utcnow(),
        )
    )).scalar_one_or_none()
    if not reset:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = (await db.execute(select(AdminUser).where(AdminUser.id == reset.admin_user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    user.password_hash = hash_password(req.new_password)
    user.password_updated_at = datetime.utcnow()
    user.failed_login_count = 0
    user.lockout_until = None
    reset.used_at = datetime.utcnow()
    await db.commit()
    return {"success": True}


# --- Admin user management (Super Admin only) ---

@router.get("/users")
async def list_admin_users(
    current_user: AdminUser = Depends(require_permission("admin.users.read")),
    db: AsyncSession = Depends(get_db),
):
    """List all admin users."""
    result = await db.execute(select(AdminUser).order_by(AdminUser.created_at.desc()))
    users = result.scalars().all()
    return {"users": [u.to_dict() for u in users]}


@router.post("/users")
async def create_admin_user(
    req: RegisterRequest,
    current_user: AdminUser = Depends(require_permission("admin.users.write")),
    db: AsyncSession = Depends(get_db),
):
    """Create a new admin user."""
    existing = (await db.execute(select(AdminUser).where(AdminUser.email == req.email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = AdminUser(
        email=req.email,
        password_hash=hash_password(req.password),
        full_name=req.full_name,
        role_id=req.role_id,
    )
    db.add(user)

    log = AdminAuditLog(actor_id=current_user.id, actor_email=current_user.email, action="create_admin_user", entity_type="admin_user", diff={"email": req.email})
    db.add(log)

    await db.commit()
    await db.refresh(user)
    return {"user": user.to_dict()}


@router.patch("/users/{user_id}")
async def update_admin_user(
    user_id: int,
    req: UpdateAdminUserRequest,
    current_user: AdminUser = Depends(require_permission("admin.users.write")),
    db: AsyncSession = Depends(get_db),
):
    """Update an admin user."""
    user = (await db.execute(select(AdminUser).where(AdminUser.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.full_name is not None:
        user.full_name = req.full_name
    if req.email is not None:
        user.email = req.email
    if req.is_active is not None:
        user.is_active = req.is_active
    if req.role_id is not None:
        user.role_id = req.role_id

    log = AdminAuditLog(actor_id=current_user.id, actor_email=current_user.email, action="update_admin_user", entity_type="admin_user", entity_id=str(user_id))
    db.add(log)
    await db.commit()
    return {"user": user.to_dict()}


@router.delete("/users/{user_id}")
async def deactivate_admin_user(
    user_id: int,
    current_user: AdminUser = Depends(require_permission("admin.users.write")),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate an admin user (soft delete)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user = (await db.execute(select(AdminUser).where(AdminUser.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    await db.commit()
    return {"success": True}


# --- Roles ---

@router.get("/roles")
async def list_roles(db: AsyncSession = Depends(get_db)):
    """List all roles."""
    result = await db.execute(select(AdminRole).order_by(AdminRole.name))
    roles = result.scalars().all()
    return {"roles": [r.to_dict() for r in roles]}


@router.post("/roles")
async def create_role(
    name: str, description: str = "", permissions: list[str] = [],
    current_user: AdminUser = Depends(require_permission("admin.roles.write")),
    db: AsyncSession = Depends(get_db),
):
    """Create a new role."""
    role = AdminRole(name=name, description=description, permissions=permissions)
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return {"role": role.to_dict()}


# --- Audit Logs ---

@router.get("/audit-logs")
async def list_audit_logs(
    page: int = 1, limit: int = 50,
    current_user: AdminUser = Depends(require_permission("admin.audit.read")),
    db: AsyncSession = Depends(get_db),
):
    """List audit logs."""
    from sqlalchemy import func
    total = await db.scalar(select(func.count()).select_from(AdminAuditLog)) or 0
    result = await db.execute(
        select(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    logs = result.scalars().all()
    return {"logs": [l.to_dict() for l in logs], "total": total, "page": page}
