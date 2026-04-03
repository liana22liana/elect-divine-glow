

## Plan: Role-Based Admin Access with Super-Admin

### Overview

Add a role system where you (super-admin) can grant admin access to other users and control which admin tabs they see. This requires both backend and frontend changes.

### Backend changes (on your VPS)

**1. Add roles to the database**

```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
-- Values: 'user', 'admin', 'superadmin'

-- Add admin permissions (which tabs an admin can see)
ALTER TABLE users ADD COLUMN admin_permissions JSONB DEFAULT '[]';
-- Example: ["materials", "structure", "users", "recommendations"]
```

Set your own account as superadmin:
```sql
UPDATE users SET role = 'superadmin' WHERE email = 'your@email.com';
```

**2. Add API endpoints**

- `PUT /api/admin/users/:id` — already exists, extend to accept `role` and `admin_permissions` fields
- Add middleware: check `role = 'admin' OR 'superadmin'` for all `/api/admin/*` routes
- Superadmin-only middleware for role management endpoints

**3. Protect admin routes server-side**

The backend should verify that the requesting user's role allows access to the specific admin function being called.

### Frontend changes

**1. Update types (`src/lib/types.ts`)**

Add `role` and `admin_permissions` fields to `UserProfile`:
```ts
role: 'user' | 'admin' | 'superadmin';
admin_permissions: TabId[];  // ["materials", "structure", "users", "recommendations"]
```

**2. Update AdminPage (`src/pages/AdminPage.tsx`)**

- Filter visible tabs based on `user.admin_permissions` (superadmin sees all)
- Add a new "Админы" section inside the "Участницы" tab (visible only to superadmin):
  - Toggle to make a user an admin
  - Checkboxes to select which tabs they can access (Материалы, Структура, Участницы, Рекомендации)

**3. Protect admin route (`src/App.tsx`)**

- Only show `/admin` route if `user.role === 'admin' || 'superadmin'`
- Hide admin link in sidebar/nav for regular users

**4. Update sidebar (`src/components/DesktopSidebar.tsx` / `src/components/BottomNav.tsx`)**

- Conditionally show admin nav link based on user role

### Files to modify

| File | Change |
|------|--------|
| `src/lib/types.ts` | Add `role`, `admin_permissions` to `UserProfile` |
| `src/pages/AdminPage.tsx` | Filter tabs by permissions; add admin management UI for superadmin |
| `src/App.tsx` | Guard `/admin` route by role |
| `src/components/DesktopSidebar.tsx` | Hide admin link for non-admin users |
| `src/components/BottomNav.tsx` | Hide admin link for non-admin users |

### Important

The backend (VPS) must be updated **first** — add the `role` and `admin_permissions` columns and update the admin middleware. Without that, the frontend changes won't have data to work with. I can implement the frontend part once you confirm the backend is ready.

