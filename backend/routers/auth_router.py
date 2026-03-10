from fastapi import APIRouter, Depends, HTTPException, status

from auth import create_access_token, get_current_user, hash_password, verify_password
from config import settings
from database import execute_read, execute_write
from models import LoginRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter(tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest):
    # Check duplicate email
    existing = await execute_read("SELECT id FROM users WHERE email = %s", (body.email,))
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = hash_password(body.password)
    await execute_write(
        "INSERT INTO users (email, full_name, hashed_password) VALUES (%s, %s, %s)",
        (body.email, body.full_name, hashed),
    )
    row = await execute_read(
        "SELECT id, email, full_name, role FROM users WHERE email = %s", (body.email,)
    )
    return UserResponse(**row[0])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    rows = await execute_read(
        "SELECT id, email, full_name, role, hashed_password, is_active FROM users WHERE email = %s",
        (body.email,),
    )
    if not rows:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = rows[0]
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="Account disabled")
    if not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        {"sub": str(user["id"]), "email": user["email"], "role": user["role"]}
    )
    return TokenResponse(access_token=token, expires_in=settings.JWT_EXPIRE_MINUTES * 60)


@router.get("/me", response_model=UserResponse)
async def me_endpoint(user: dict = Depends(get_current_user)):
    rows = await execute_read(
        "SELECT id, email, full_name, role FROM users WHERE id = %s",
        (int(user["sub"]),),
    )
    if not rows:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**rows[0])
