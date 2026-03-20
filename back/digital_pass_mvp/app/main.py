from fastapi import FastAPI, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import json
import uuid
from datetime import datetime

from app import models, database, auth, crud
from app.database import engine, Base

# Создаем таблицы при старте
async def init_db():
    async with engine.begin() as conn:
        # Внимание! drop_all удалит все таблицы
        # await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

app = FastAPI(
    title="Digital Pass MVP",
    description="API для генерации цифрового пропуска сотрудника (QR-код) с MySQL",
    version="1.0.0"
)

# Инициализация БД при старте
@app.on_event("startup")
async def startup():
    await init_db()

# ---- 1. Регистрация пользователя ----
@app.post(
    "/api/register",
    response_model=models.UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Регистрация пользователя"
)
async def register(
    user_data: models.UserRegister,
    db: AsyncSession = Depends(database.get_db)
):
    """
    Создает цифровой профиль сотрудника в MySQL.
    """
    try:
        created_user = await crud.create_user(
            db=db,
            username=user_data.username,
            password=user_data.password,
            email=user_data.email,
            full_name=user_data.full_name
        )
        return models.UserResponse(
            username=created_user.username,
            email=created_user.email,
            full_name=created_user.full_name
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

# ---- 2. Авторизация пользователя ----
@app.post(
    "/api/auth/login",
    response_model=models.Token,
    summary="Авторизация и получение JWT токена"
)
async def login(
    login_data: models.UserLogin,
    db: AsyncSession = Depends(database.get_db)
):
    """
    Проверяет логин и пароль в MySQL, возвращает JWT токен.
    """
    user = await crud.authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# ---- 3. Генерация пропуска (заглушка) ----
@app.get(
    "/api/pass/generate",
    response_model=models.PassResponse,
    summary="Сгенерировать цифровой пропуск"
)
async def generate_pass(
    current_user = Depends(auth.get_current_user)
):
    """
    Защищенный эндпоинт. Возвращает данные для QR-кода.
    """
    qr_payload = {
        "pass_id": str(uuid.uuid4()),
        "user_id": current_user.username,
        "full_name": current_user.full_name or current_user.username,
        "email": current_user.email,
        "timestamp": str(datetime.utcnow()),
        "valid_for_minutes": 15
    }
    
    qr_data = json.dumps(qr_payload)
    
    return {
        "qr_code_data": qr_data,
        "message": "Пропуск успешно сгенерирован. Действителен 15 минут.",
        "user_info": {
            "username": current_user.username,
            "full_name": current_user.full_name or "",
            "email": current_user.email
        }
    }

# ---- Healthcheck ----
@app.get("/api/health")
async def health_check(db: AsyncSession = Depends(database.get_db)):
    """Проверка подключения к MySQL"""
    try:
        await db.execute("SELECT 1")
        return {"status": "ok", "message": "Digital Pass MVP is running", "database": "connected"}
    except Exception as e:
        return {"status": "error", "message": "Database connection failed", "error": str(e)}

@app.get("/")
async def root():
    return {
        "message": "Welcome to Digital Pass MVP API with MySQL",
        "docs": "/docs",
        "endpoints": ["/api/register", "/api/auth/login", "/api/pass/generate"]
    }