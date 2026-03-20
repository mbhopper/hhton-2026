from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from app import schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_user_by_username(db: AsyncSession, username: str):
    """Получить пользователя по username"""
    result = await db.execute(
        select(schemas.User).where(schemas.User.username == username)
    )
    return result.scalar_one_or_none()

async def get_user_by_email(db: AsyncSession, email: str):
    """Получить пользователя по email"""
    result = await db.execute(
        select(schemas.User).where(schemas.User.email == email)
    )
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, username: str, password: str, email: str, full_name: str = None):
    """Создать нового пользователя"""
    # Проверяем, существует ли пользователь
    existing_user = await get_user_by_username(db, username)
    if existing_user:
        raise ValueError("Username already exists")
    
    existing_email = await get_user_by_email(db, email)
    if existing_email:
        raise ValueError("Email already registered")
    
    # Хешируем пароль
    hashed_password = pwd_context.hash(password)
    
    # Создаем пользователя
    db_user = schemas.User(
        username=username,
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        is_active=True
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return db_user

async def verify_password(db: AsyncSession, username: str, plain_password: str):
    """Проверить пароль пользователя"""
    user = await get_user_by_username(db, username)
    if not user:
        return False
    
    return pwd_context.verify(plain_password, user.hashed_password)

async def authenticate_user(db: AsyncSession, username: str, password: str):
    """Аутентификация пользователя"""
    user = await get_user_by_username(db, username)
    if not user:
        return None
    
    if not pwd_context.verify(password, user.hashed_password):
        return None
    
    return user