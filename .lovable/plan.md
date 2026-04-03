

## Plan: Connect Frontend to External API

Replace all mock data with real API calls to `http://83.147.247.183:3000`.

### Overview

Create an API client layer, update AuthContext for real JWT auth, and replace mock data imports across all pages with React Query hooks that fetch from the VPS API.

### Files to create

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | API client — base fetch wrapper with JWT token management, error handling, and all endpoint methods (auth, materials, sections, habits, profile, admin) |
| `src/hooks/useApiData.ts` | React Query hooks: `useSections`, `useMaterials`, `useMaterial`, `useProfile`, `useHabits`, `useHabitLogs`, `useUsers` (admin), etc. + mutation hooks for login, register, create/delete habit, mark habit log |

### Files to modify

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Store JWT token in state + localStorage. `login(email, password)` calls `POST /api/auth/login`, saves token. `logout()` clears token. Add `token`, `user` to context. On mount, check localStorage for token and call `GET /api/auth/me` to restore session. |
| `src/pages/LoginPage.tsx` | Pass email/password to `login(email, password)`. Handle errors (show toast). |
| `src/pages/HomePage.tsx` | Replace `mockMaterials` / `LIBRARY_SECTIONS` with `useMaterials` / `useSections` hooks. Show loading skeleton. |
| `src/pages/LibraryPage.tsx` | Replace `mockMaterials` / `LIBRARY_SECTIONS` / `mockUser` with hooks. Pass section/subsection filters to API query params. |
| `src/pages/MaterialPage.tsx` | Replace `mockMaterials.find()` with `useMaterial(id)` hook. |
| `src/pages/GoalsPage.tsx` | Replace `mockHabits` / `mockHabitLogs` with `useHabits` / `useHabitLogs` hooks. Use mutation for marking habit complete. |
| `src/pages/ProfilePage.tsx` | Replace `mockUser` with `useProfile` hook (or user from AuthContext). |
| `src/pages/AdminPage.tsx` | Replace `mockMaterials`, `mockUsers`, `mockHabitTemplates`, `LIBRARY_SECTIONS` with admin API hooks. Wire up create/edit/delete buttons to mutations. |
| `src/components/DesktopSidebar.tsx` | Replace `mockUser` with user from AuthContext. |
| `src/components/HabitCard.tsx` | Remove `LIBRARY_SECTIONS` import, receive section label as prop or from parent. |
| `src/components/MaterialCard.tsx` | Minimal changes — data already comes via props. |
| `src/components/CategoryCard.tsx` | Minimal changes — data comes via props. |

### Technical approach

**API Client (`src/lib/api.ts`)**:
- Base URL: `http://83.147.247.183:3000`
- All requests include `Authorization: Bearer <token>` header when token exists
- Methods: `api.auth.login(email, pw)`, `api.auth.register(...)`, `api.auth.me()`, `api.materials.list(params)`, `api.materials.get(id)`, `api.sections.list()`, `api.habits.list()`, `api.habits.create(data)`, `api.habits.markLog(habitId, date)`, `api.profile.get()`, `api.profile.update(data)`, `api.admin.users()`, `api.admin.materials.create/update/delete()`

**AuthContext changes**:
- `login(email, password)` → calls API, stores token in localStorage + state
- On app mount: reads token from localStorage, calls `/api/auth/me` to validate
- Exports `user` (profile data) and `token` alongside `isAuthenticated`

**React Query hooks**:
- Each hook uses `useQuery` with appropriate query keys
- Mutations use `useMutation` with `queryClient.invalidateQueries` for cache refresh
- Loading/error states handled in components with skeletons

**Types**: Keep existing interfaces from `mock-data.ts` (Material, Habit, etc.) but move them to a `src/lib/types.ts` file. `mock-data.ts` will be kept temporarily as fallback reference but no longer imported by components.

### Order of implementation

1. Create `src/lib/types.ts` — extract interfaces from mock-data
2. Create `src/lib/api.ts` — API client
3. Update `src/contexts/AuthContext.tsx` — real auth with JWT
4. Create `src/hooks/useApiData.ts` — React Query hooks
5. Update `LoginPage` — real login
6. Update all pages (Home, Library, Material, Goals, Profile, Admin) — replace mocks with hooks
7. Update `DesktopSidebar` — use user from context

