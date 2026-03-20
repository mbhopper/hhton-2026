# rtk-backend-python

Полная Python-версия текущего `rtk-backend` (Flask + PostgreSQL).

## Установка

1. Создайте и активируйте виртуальное окружение:
   - `python -m venv .venv`
   - `.venv\Scripts\activate`
2. Установите зависимости:
   - `pip install -r requirements.txt`
3. Создайте `.env` на базе `.env.example`.
4. Запустите:
   - `python app.py`

## Эндпоинты

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/qr/generate` (JWT)
- `POST /api/qr/validate`
- `GET /api/qr/current` (JWT)
- `GET /api/qr/stats` (JWT)
- `GET /health`
- `GET /` (UI)
