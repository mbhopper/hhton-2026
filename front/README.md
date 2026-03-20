# Future React Base

Готовая стартовая база для будущего проекта на **React + TypeScript + Vite**.

Внутри уже есть:
- современная одностраничная структура;
- темный премиальный UI с градиентами и glassmorphism;
- разбиение на `layout`, `sections`, `ui`, `styles`, `data`;
- готовая точка для дальнейшего расширения.

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Структура

```text
src/
  components/
    layout/
    sections/
    ui/
  data/
  styles/
  App.tsx
  main.tsx
```

## Что удобно менять в первую очередь

1. `src/data/content.ts` — тексты, карточки, шаги, меню.
2. `src/styles/global.css` — палитра, отступы, эффекты, адаптив.
3. `src/components/sections/*` — структура конкретных секций.

## Что можно добавить дальше

- React Router
- API слой (`services/` или `lib/api/`)
- Zustand / Redux / TanStack Query
- формы
- авторизацию
- dashboard / admin panel
- дизайн-систему
