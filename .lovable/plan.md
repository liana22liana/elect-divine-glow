

## Редизайн: фон "пасмурное небо" #8A9EA6

### Концепция

Перевести всю платформу на палитру "пасмурного неба" — мягкий серо-голубой фон вместо бежевого. Золото остаётся акцентом. Результат: утончённая, прохладная атмосфера с тёплыми золотыми вспышками. Люксовый контраст "холод + тепло".

Не использовать #8A9EA6 напрямую как bg (слишком тёмный) — взять его как базовый тон и построить шкалу:

```text
Palette (HSL based on #8A9EA6 = 200° 11% 60%):

Background:        200 18% 93%   — очень светлое пасмурное небо
Card:              200 15% 97%   — почти белый с голубым оттенком  
Foreground:        210 25% 14%   — глубокий тёмно-синий
Muted:             200 14% 88%   — приглушённый серо-голубой
Muted-foreground:  200 11% 50%   — средний серо-голубой (текст)
Border:            200 13% 84%   — мягкая граница
Primary:           42 52% 54%    — золото (без изменений)
Primary-fg:        200 18% 97%   — белый на золоте
Secondary:         200 11% 60%   — сам #8A9EA6
Accent:            200 11% 60%   — #8A9EA6
Ring:              42 52% 54%    — золотое кольцо фокуса
Destructive:       0 84% 60%     — без изменений

Sidebar:           200 15% 95%
Sidebar-accent:    200 14% 90%
```

Dark mode: инвертировать — тёмный серо-синий фон, те же акценты.

### Файлы

| Файл | Изменение |
|------|-----------|
| `src/index.css` | Полностью новая палитра CSS-переменных (light + dark) |
| `src/pages/ProfilePage.tsx` | Обновить bg шапки: `bg-sky/[0.15]` → `bg-card` (карточки теперь сами "небесные"), убрать разделители `bg-sky/20` → `bg-border` |
| `src/components/AmbassadorTimeline.tsx` | Линии: `bg-sky` → `bg-primary` (пройденные золотые), `bg-sky/30` → `bg-border` (будущие) |
| `src/components/MaterialCard.tsx` | Теги: `bg-sky/[0.15] text-sky` → `bg-secondary/15 text-secondary`, замок: `text-sky` → `text-secondary` |
| `src/components/CategoryCard.tsx` | Иконки: `bg-sky/[0.15] text-sky` → `bg-secondary/15 text-secondary` |
| `src/components/AmbassadorCongratDialog.tsx` | Градиент: `to-sky/10` → `to-secondary/10` |
| `src/components/BottomNav.tsx` | `bg-card/95` остаётся — обновится автоматически через переменные |
| `src/components/DesktopSidebar.tsx` | `bg-card/80` — обновится автоматически |
| `src/pages/LoginPage.tsx` | Градиент `from-background via-card to-muted` — обновится автоматически |

Большинство компонентов используют семантические классы (`bg-background`, `bg-card`, `text-muted-foreground`, `border-border`) — они обновятся автоматически через CSS-переменные. Точечные правки нужны только там, где использовались `sky`-классы напрямую.

