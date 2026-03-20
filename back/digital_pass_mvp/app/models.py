from pydantic import BaseModel, EmailStr
from typing import Optional

# --- Схемы для регистрации ---
class UserRegister(BaseModel):
    username: str
    password: str
    email: EmailStr
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None

# --- Схемы для авторизации (Login) ---
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Схема для ответа с пропуском ---
class PassResponse(BaseModel):
    qr_code_data: str
    message: str
    user_info: dict