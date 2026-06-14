# SWOP — платформа бартерного обмена

Веб-платформа для прямого обмена вещами между пользователями без использования денег.

## Стек технологий

**Backend**
- NestJS + TypeScript
- MySQL 8.0 / TypeORM (поддерживаются также PostgreSQL и SQLite)
- JWT (access + refresh токены)
- Socket.IO (WebSocket-чат в реальном времени)
- Swagger / OpenAPI

**Frontend**
- React 19 + TypeScript + Vite
- Redux Toolkit
- React Router DOM v7
- Tailwind CSS
- React Hook Form + Zod

## Возможности

- Регистрация и аутентификация (JWT, bcrypt)
- Каталог товаров с поиском, фильтрацией и пагинацией
- Создание объявлений с загрузкой фотографий
- Торговые предложения с полным жизненным циклом сделки
- Встроенный чат в реальном времени
- Система отзывов и рейтингов
- Избранное
- Подбор потенциальных обменов по совпадению интересов
- Уведомления
- Панель администратора

## Структура проекта

```
backend/    NestJS-приложение (REST API + WebSocket)
frontend/   React SPA
database/   SQL-схема для инициализации БД
```

## Запуск в режиме разработки

```bash
# Серверная часть (порт 3001)
cd backend
npm install
cp .env.example .env   # и заполнить значения
npm run start:dev

# Клиентская часть (порт 5173, в отдельном терминале)
cd frontend
npm install
npm run dev
```

После запуска:
- Фронтенд — http://localhost:5173
- API — http://localhost:3001/api
- Swagger-документация — http://localhost:3001/api/docs

## Переменные окружения

См. `backend/.env.example` — там описаны все необходимые переменные (подключение к БД, JWT-секреты, URL фронтенда для CORS).
