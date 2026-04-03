

## Plan: Make Admin Panel Fully Functional

Wire up all admin forms (create, edit, delete) to the real API and add missing mutation hooks.

### What will change

**1. New mutation hooks in `src/hooks/useApiData.ts`**

Add hooks that are currently missing:
- `useUpdateMaterial` — `PUT /admin/materials/:id`
- `useCreateSection` — `POST /admin/sections`
- `useUpdateSection` — `PUT /admin/sections/:id`
- `useDeleteSection` — `DELETE /admin/sections/:id`
- `useCreateSubsection` — `POST /admin/subsections`
- `useDeleteSubsection` — `DELETE /admin/subsections/:id`
- `useCreateTemplate` — `POST /admin/templates`
- `useUpdateUser` — `PUT /admin/users/:id` (ambassador status, gifts, delivery)

**2. Rewrite `src/pages/AdminPage.tsx`**

Currently all dialogs are "dead" — forms don't collect state and buttons don't call the API. Changes:

- **Materials tab**: Add controlled form state (`title`, `description`, `section_id`, `subsection_id`, `type`, `video_url`). "Сохранить" calls `useCreateMaterial` or `useUpdateMaterial`. Pencil button opens dialog pre-filled with existing data. Trash button shows confirmation dialog then calls `useDeleteMaterial`.

- **Structure tab**: Section dialog collects `name` + `icon`, calls `useCreateSection` / `useUpdateSection`. Subsection dialog collects `name`, calls `useCreateSubsection` with `parentSectionId`. Pencil and trash buttons on sections/subsections wired to edit/delete with confirmation.

- **Users tab**: Ambassador status switch calls `useUpdateUser` with `ambassador_status_override`. Status dropdown calls `useUpdateUser` with selected status. TG link send button calls `useUpdateUser`. Physical gift status dropdown calls `useUpdateUser`. All changes save immediately on interaction.

- **Recommendations tab**: Dialog collects `title`, `description`, `category`, `source_content_id` and calls `useCreateTemplate`. Pencil button opens pre-filled edit form. Delete already works via `useDeleteTemplate`.

- **Universal delete confirmation**: Extend the existing `AlertDialog` to handle all entity types (materials, sections, subsections, templates) — store `deleteTarget: { type, id }` instead of just `deleteId`.

**3. Toast notifications**

Add success/error toasts on all mutations using `onSuccess` / `onError` callbacks so the admin gets feedback.

### Technical details

- All form state managed with `useState` in AdminPage (no external form library needed — forms are simple)
- Edit mode: store `editingItem` state; when set, dialog opens pre-filled and submit calls update instead of create
- After each mutation success, React Query automatically refetches the relevant list via `invalidateQueries`
- Input validation: required fields checked client-side before submit; API returns errors for server-side validation

### Files to modify

| File | Changes |
|------|---------|
| `src/hooks/useApiData.ts` | Add 7 new mutation hooks (section/subsection CRUD, update material, create template, update user) |
| `src/pages/AdminPage.tsx` | Wire all forms with controlled state, connect to mutations, add edit mode, universal delete confirmation, toast feedback |
| `src/lib/api.ts` | Verify all admin endpoints exist (most already do — may need `subsections.update`) |

### Order of implementation

1. Add missing mutation hooks to `useApiData.ts`
2. Refactor AdminPage — add form state management for all 4 tabs
3. Connect create/edit/delete buttons to mutations with toast feedback
4. Add universal delete confirmation dialog

