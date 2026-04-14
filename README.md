# GigaChat UI

Чат-приложение с подключением к GigaChat API, построенное на React + TypeScript + Vite.

## Демо

> Приложение развёрнуто на Vercel: **[https://mipt-frontend-homework.vercel.app](https://mipt-frontend-homework.vercel.app)**

Скриншот анализа бандла — `docs/bundle-report.html` (интерактивный), основные чанки:

| Чанк | Размер (gzip) |
|---|---|
| `markdown` (react-markdown + syntax-highlighter) | 262 kB |
| `react-vendor` (react, react-dom, react-router-dom) | 57 kB |
| `index` (основной код приложения) | 24 kB |
| `Sidebar` (lazy chunk) | 2.7 kB |
| `SettingsPanel` (lazy chunk) | 1.6 kB |

## Стек

| Технология | Версия |
|---|---|
| React | 19.2.4 |
| TypeScript | 5.9.3 |
| React Router DOM | 7.14.0 |
| react-markdown | 10.1.0 |
| react-syntax-highlighter | 16.1.1 |
| Vite | 8.0.0 |
| Vitest | 4.1.4 |
| CSS Modules | — |

Стейт-менеджмент: `useReducer` + `useCallback` + localStorage persistence.

## Запуск локально

```bash
# 1. Клонировать репозиторий
git clone https://github.com/<your-username>/frontend-homework.git
cd frontend-homework

# 2. Установить зависимости
npm install

# 3. Создать файл с переменными окружения
cp .env.example .env
# Заполните .env своими значениями (см. секцию ниже)

# 4. Запустить dev-сервер
npm run dev
```

Приложение будет доступно на `http://localhost:5173`.

## Переменные окружения

Создайте файл `.env` в корне проекта на основе `.env.example`:

| Переменная | Описание | Обязательная |
|---|---|---|
| `VITE_GIGACHAT_CLIENT_ID` | Client ID для GigaChat API (Sber Developer Portal) | Нет (без него работает демо-режим) |
| `VITE_GIGACHAT_CLIENT_SECRET` | Client Secret для GigaChat API | Нет |

> Токен API никогда не размещается в коде — передаётся только через `import.meta.env.VITE_*` переменные и вводится пользователем на экране авторизации.

## Оптимизации

- **React.memo** — `ChatItem` не перерисовывается при изменении другого чата
- **useMemo** — фильтрация чатов при поиске вычисляется только при изменении `chats` или `searchQuery`
- **useCallback** — обработчики `onSend`, `onDelete`, `onRename`, `onSelectChat` мемоизированы
- **React.lazy + Suspense** — `Sidebar` и `SettingsPanel` загружаются отдельными чанками
- **manualChunks** — `react-markdown` и `react-syntax-highlighter` вынесены в отдельный `markdown`-чанк, не попадают в основной бандл
- **ErrorBoundary** — изолирует ошибки рендера в области сообщений, не ломает сайдбар; имеет кнопку «Повторить»

## Тесты

```bash
npm test          # запуск в watch-режиме
npm test -- --run # однократный запуск
npm run test:coverage
```
