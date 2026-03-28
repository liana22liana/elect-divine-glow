

## Оценка текущего дизайна и план доработки до 100/100

### Текущие проблемы (оценка ~65/100)

1. **Фон остался бежевым** — палитра "пасмурного неба" утверждена, но не применена к `--background`
2. **Карточки сливаются с фоном** — бежевый на бежевом, нет контраста
3. **Карточки материалов пустые** — серый прямоугольник с бледной иконкой, выглядит как placeholder
4. **Категории однообразные** — одинаковые серые круги, нет визуального различия
5. **Sidebar плоский** — нет выразительного логотипа, нет аватара пользователя
6. **Нет микро-анимаций** — платформа ощущается статичной
7. **Кнопки и табы невыразительные** — стандартные, без premium-feel

### План доработки

**1. Новая палитра CSS (`src/index.css`)**

Переход на серо-голубой фон с белыми карточками — максимальный контраст:

```text
Light:
  background:     200 18% 92%    (светлое пасмурное небо)
  card:           200 10% 98%    (почти белый — карточки чётко видны)
  foreground:     210 25% 14%    (глубокий тёмно-синий)
  muted:          200 14% 87%    (приглушённый серо-голубой)
  muted-fg:       200 11% 50%    (читаемый вторичный текст — темнее)
  border:         200 13% 84%    (мягкая серо-голубая граница)
  primary:        42 52% 54%     (золото — без изменений)
  sidebar-bg:     200 15% 96%    (чуть светлее фона)

Dark:
  background:     210 20% 8%     (глубокий стальной)
  card:           210 18% 13%    (чуть светлее фона)
  foreground:     200 15% 90%
  muted:          210 15% 18%
  muted-fg:       200 11% 55%
  border:         210 12% 20%
```

**2. Карточки материалов — gradient-обложки (`src/components/MaterialCard.tsx`)**

Вместо пустого серого прямоугольника — уникальные градиентные обложки по разделам:
- Деньги: `from-amber-100 to-yellow-50`
- Отношения: `from-rose-100 to-pink-50`
- Мышление: `from-violet-100 to-indigo-50`
- Практики: `from-sky-100 to-blue-50`
- Тело: `from-emerald-100 to-green-50`
- Эксперты: `from-orange-100 to-amber-50`
- Управление реальностью: `from-fuchsia-100 to-purple-50`

Иконка типа (видео/аудио) крупнее и по центру, с легкой тенью.

**3. Карточки категорий — цветовые акценты (`src/components/CategoryCard.tsx`)**

Каждая категория получает свой мягкий цвет (тот же gradient-маппинг):
- Фон иконки цветной (вместо одинакового серо-голубого)
- Hover: лёгкий `scale-[1.02]` + `shadow-md` transition

**4. Sidebar — premium feel (`src/components/DesktopSidebar.tsx`)**

- Добавить тонкую золотую линию-акцент под логотипом
- Активный пункт: `bg-primary/10` с левым золотым бордюром `border-l-2 border-primary`
- Аватар пользователя внизу (рядом с "Выйти")

**5. Bottom navigation — glass-morphism (`src/components/BottomNav.tsx`)**

- `backdrop-blur-xl` + `bg-card/80` + `border-t border-border/50`
- Активная иконка: маленькая золотая точка под ней

**6. Микро-анимации (`src/index.css`)**

Добавить keyframes:
- `fade-in`: карточки появляются при загрузке
- `slide-up`: контент при переходе между страницами
- Все карточки: `transition-all duration-200`

**7. Привычки — улучшения (`src/components/HabitCard.tsx`)**

- Круглые точки 28-дневной сетки: вместо `bg-primary` для выполненных — цвет категории (тот же маппинг)
- Streak badge: добавить легкое свечение `shadow-sm shadow-primary/30`

**8. Login — атмосфера (`src/pages/LoginPage.tsx`)**

- Градиент `from-background via-card to-muted` обновится автоматически
- Добавить тонкую золотую линию под "ELECT"

**9. Общее: карточки**

- Все карточки: `shadow-sm` по умолчанию, `hover:shadow-md` + `hover:border-primary/20`
- `rounded-2xl` вместо `rounded-lg` для премиум-ощущения

### Файлы

| Действие | Файл |
|----------|------|
| Изменить | `src/index.css` — новая палитра + keyframes анимаций |
| Изменить | `tailwind.config.ts` — animation utilities |
| Изменить | `src/components/MaterialCard.tsx` — gradient-обложки по разделам |
| Изменить | `src/components/CategoryCard.tsx` — цветовые акценты по категориям |
| Изменить | `src/components/DesktopSidebar.tsx` — gold accent, active border |
| Изменить | `src/components/BottomNav.tsx` — glass-morphism, active dot |
| Изменить | `src/components/HabitCard.tsx` — цветные точки, свечение streak |
| Изменить | `src/pages/LoginPage.tsx` — золотая линия под логотипом |
| Изменить | `src/pages/HomePage.tsx` — fade-in анимация карточек |
| Изменить | `src/pages/ProfilePage.tsx` — обновить под новую палитру (убрать хардкод sky) |
| Изменить | `src/components/AmbassadorTimeline.tsx` — обновить цвета линий |

