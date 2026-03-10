"""
QueryMind — interactive user creation script.

Usage:
    python create_user.py

You will be prompted for:
    • Full name
    • Email address
    • Password
    • Role  (admin | analyst | viewer)  — defaults to analyst

The script hashes the password with the same scheme used by auth.py
(SHA-256 normalise → bcrypt) and inserts the row into the users table.

It also prints the bcrypt hash so you can record it when pre-seeding.
"""

import asyncio
import getpass
import hashlib
import sys

import bcrypt

# ── Inline DB helpers (no FastAPI context needed) ─────────────────────────────
import aiomysql
from dotenv import load_dotenv
import os

load_dotenv()


async def get_conn():
    return await aiomysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        db=os.getenv("DB_NAME", "nexamart"),
        autocommit=True,
        cursorclass=aiomysql.DictCursor,
    )


def hash_password(plain: str) -> str:
    """Normalise with SHA-256 then bcrypt — must match auth.py exactly."""
    normalised = hashlib.sha256(plain.encode("utf-8")).hexdigest().encode("utf-8")
    return bcrypt.hashpw(normalised, bcrypt.gensalt(rounds=12)).decode("utf-8")


async def create_user(full_name: str, email: str, password: str, role: str) -> None:
    hashed = hash_password(password)
    print(f"\n  Bcrypt hash : {hashed}")

    conn = await get_conn()
    try:
        async with conn.cursor() as cur:
            # Check duplicate
            await cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if await cur.fetchone():
                print(f"\n  ✗  A user with email '{email}' already exists.")
                return

            await cur.execute(
                "INSERT INTO users (email, full_name, hashed_password, role, is_active) "
                "VALUES (%s, %s, %s, %s, 1)",
                (email, full_name, hashed, role),
            )
            await cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            row = await cur.fetchone()
            print(f"\n  ✓  User created successfully!")
            print(f"     ID    : {row['id']}")
            print(f"     Name  : {full_name}")
            print(f"     Email : {email}")
            print(f"     Role  : {role}")
    finally:
        conn.close()


VALID_ROLES = {"admin", "analyst", "viewer"}


def prompt_role() -> str:
    while True:
        role = input("Role [admin / analyst / viewer]  (default: analyst): ").strip().lower()
        if role == "":
            return "analyst"
        if role in VALID_ROLES:
            return role
        print("  Please enter one of: admin, analyst, viewer")


async def main():
    print("=" * 55)
    print("  QueryMind — Create User")
    print("=" * 55)
    print()

    full_name = input("Full name   : ").strip()
    if not full_name:
        print("Full name cannot be empty.")
        sys.exit(1)

    email = input("Email       : ").strip().lower()
    if "@" not in email or "." not in email:
        print("Please enter a valid email address.")
        sys.exit(1)

    password = getpass.getpass("Password    : ")
    if len(password) < 8:
        print("Password must be at least 8 characters.")
        sys.exit(1)

    confirm = getpass.getpass("Confirm pwd : ")
    if password != confirm:
        print("Passwords do not match.")
        sys.exit(1)

    role = prompt_role()

    print()
    await create_user(full_name, email, password, role)
    print()


if __name__ == "__main__":
    asyncio.run(main())
