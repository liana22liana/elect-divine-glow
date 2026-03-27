

## Обновление цветовой схемы — акцент "пасмурное небо" #8A9EA6

### Обзор
Добавить `#8A9EA6` как вспомогательный акцентный цвет в конкретные элементы платформы. CSS-переменная `--secondary` уже настроена на близкий HSL (`193 18% 42%`), но `#8A9EA6` = `200 11% 60%` — светлее. Обновим `--muted-foreground` на точный HSL `#8A9EA6` и добавим утилитарный цвет `sky` в Tailwind.

### Изменения

**1. CSS-переменные (`src/index.css`)**
- Обновить `--muted-foreground` на `200 11% 60%` (точный HSL для `#8A9EA6`) — это автоматически обновит весь вторичный текст по платформе
- Добавить кастомную переменную `--sky: 200 11% 60%` для прямого использования

**2. Tailwind (`tailwind.config.ts`)**
- Добавить цвет `sky` в `extend.colors`: `"hsl(var(--sky))"`

**3. Профиль (`src/pages/ProfilePage.tsx`)**
- Фон шапки: добавить `bg-[#8A9EA6]/[0.15]` на карточку шапки (вместо `bg-card`)
- Статус "active": изменить `bg-green-500` → `bg-[#8A9EA6]`
- Текст дат уже использует `text-muted-foreground` — обновится автоматически

**4. Timeline (`src/components/AmbassadorTimeline.tsx`)**
- Пройденные линии: `bg-primary` → `bg-[#8A9EA6]`
- Будущие линии: `bg-border` → `bg-[#8A9EA6]/30`
- Круги пройденных этапов остаются золотыми (primary) — это подарочные milestone

**5. Библиотека — теги (`src/components/MaterialCard.tsx`)**
- Теги раздела: `bg-primary/10 text-primary border-primary/30` → `bg-[#8A9EA6]/15 text-[#8A9EA6] border-[#8A9EA6]/30`
- Иконка замка: `text-primary-foreground` → `text-[#8A9EA6]`

**6. Категории (`src/components/CategoryCard.tsx`)**
- Иконки: `text-primary` → `text-[#8A9EA6]`
- Фон иконки: `bg-primary/10` → `bg-[#8A9EA6]/15`

**7. Модалка поздравлений (`src/components/AmbassadorCongratDialog.tsx`)**
- Добавить градиентный фон на `DialogContent`: `bg-gradient-to-b from-card to-[#8A9EA6]/10`

**8. Разделители — общие**
- Обновить `--border` в CSS на `#8A9EA6` с opacity 0.2: это повлияет на все `border-border` по платформе. Вместо этого точечно: добавить `<Separator>` с классом `bg-[#8A9EA6]/20` между секциями в `ProfilePage`

### Файлы

| Действие | Файл |
|----------|------|
| Изменить | `src/index.css` — обновить `--muted-foreground` |
| Изменить | `tailwind.config.ts` — добавить цвет `sky` |
| Изменить | `src/pages/ProfilePage.tsx` — фон шапки, статус подписки, разделители |
| Изменить | `src/components/AmbassadorTimeline.tsx` — цвет линий timeline |
| Изменить | `src/components/MaterialCard.tsx` — теги и замок |
| Изменить | `src/components/CategoryCard.tsx` — иконки |
| Изменить | `src/components/AmbassadorCongratDialog.tsx` — градиент фона |

