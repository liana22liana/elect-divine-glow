

## Превью всегда на главной, toggle только в библиотеке

### Что нужно

На главной странице `MaterialCard` всегда рендерится в режиме карточек с обложками (превью). Переключатель остаётся только на странице библиотеки.

### Изменение

**`src/pages/HomePage.tsx`** (строка 66)

Передать `previewEnabled={true}` в `MaterialCard`:

```tsx
<MaterialCard material={material} previewEnabled={true} />
```

Больше ничего менять не нужно — `LibraryPage` уже имеет toggle, а `MaterialCard` уже поддерживает prop.

### Файлы

| Файл | Изменение |
|------|-----------|
| `src/pages/HomePage.tsx` | Добавить `previewEnabled={true}` в MaterialCard |

