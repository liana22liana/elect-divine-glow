
## Добавить заглушку авторизации

Страница входа (`LoginPage`) уже существует. Нужно добавить простой контекст авторизации-заглушку и связать всё воедино.

### Что делаем

1. **`src/contexts/AuthContext.tsx`** — новый файл. React-контекст с состоянием `isAuthenticated` (boolean) и функциями `login()` / `logout()`. `login()` ставит `true`, `logout()` — `false` и редиректит на `/login`. Состояние хранится в `useState` (сбрасывается при перезагрузке — это заглушка).

2. **`src/App.tsx`** — обернуть приложение в `AuthProvider`. Добавить защиту маршрутов: `AppLayout` показывать только если `isAuthenticated`, иначе редирект на `/login`.

3. **`src/pages/LoginPage.tsx`** — вызывать `login()` из контекста при сабмите формы.

4. **`src/pages/ProfilePage.tsx`** — кнопка «Выйти» вызывает `logout()`.

5. **`src/components/DesktopSidebar.tsx`** — кнопка «Выйти» вызывает `logout()`.

### Файлы

| Файл | Изменение |
|------|-----------|
| `src/contexts/AuthContext.tsx` | Новый — контекст авторизации-заглушка |
| `src/App.tsx` | Обернуть в `AuthProvider`, защитить маршруты |
| `src/pages/LoginPage.tsx` | Использовать `login()` из контекста |
| `src/pages/ProfilePage.tsx` | Кнопка «Выйти» → `logout()` |
| `src/components/DesktopSidebar.tsx` | Кнопка «Выйти» → `logout()` |
