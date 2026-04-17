const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:3000/api"
  : "/api";

export function getToken(): string | null {
  try {
    return localStorage.getItem("elect_token") || sessionStorage.getItem("elect_token");
  } catch {
    return sessionStorage.getItem("elect_token");
  }
}

export function setToken(token: string) {
  try { localStorage.setItem("elect_token", token); } catch {}
  try { sessionStorage.setItem("elect_token", token); } catch {}
}

export function clearToken() {
  try { localStorage.removeItem("elect_token"); } catch {}
  try { sessionStorage.removeItem("elect_token"); } catch {}
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err: any = new Error(body.error || body.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = body.code;
    throw err;
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ── Auth ──

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name: string, invite_token?: string) =>
      request<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name, invite_token }),
      }),
    me: () => request<any>("/auth/me"),
    accessLink: (token: string) =>
      request<{ token: string; user: any }>(`/auth/magic/${token}`),
    forgotPassword: (email: string) =>
      request<{ ok: boolean }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token: string, password: string) =>
      request<{ ok: boolean }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      }),
  },

  // ── Profile ──
  profile: {
    get: () => request<any>("/profile"),
    update: (data: Record<string, any>) =>
      request<any>("/profile", { method: "PUT", body: JSON.stringify(data) }),
  },

  // ── Sections ──
  sections: {
    list: () => request<any[]>("/sections"),
  },

  // ── Materials ──
  materials: {
    list: (params?: { section_id?: string; subsection_id?: string }) => {
      const qs = new URLSearchParams();
      if (params?.section_id) qs.set("section_id", params.section_id);
      if (params?.subsection_id) qs.set("subsection_id", params.subsection_id);
      const q = qs.toString();
      return request<any[]>(`/materials${q ? `?${q}` : ""}`);
    },
    get: (id: string) => request<any>(`/materials/${id}`),
    progress: () => request<any[]>("/materials/progress"),
    markWatched: (id: string) => request<any>(`/materials/${id}/watched`, { method: "POST" }),
    unmarkWatched: (id: string) => request<void>(`/materials/${id}/watched`, { method: "DELETE" }),
    create: (data: Record<string, any>) =>
      request<any>("/admin/materials", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, any>) =>
      request<any>(`/admin/materials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/admin/materials/${id}`, { method: "DELETE" }),
  },

  // ── Habits ──
  habits: {
    list: () => request<any[]>("/habits"),
    create: (data: Record<string, any>) =>
      request<any>("/habits", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, any>) =>
      request<any>(`/habits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/habits/${id}`, { method: "DELETE" }),
    logs: (habitId: string) => request<any[]>(`/habits/${habitId}/logs`),
    markLog: (habitId: string, date: string) =>
      request<any>(`/habits/${habitId}/logs`, {
        method: "POST",
        body: JSON.stringify({ date }),
      }),
    toggleLog: (habitId: string, date: string, completed: boolean) =>
      request<any>(`/habits/${habitId}/logs`, {
        method: "POST",
        body: JSON.stringify({ date, completed }),
      }),
    templates: () => request<any[]>("/habits/templates"),
  },

  // ── Habit Templates ──
  templates: {
    list: () => request<any[]>("/admin/templates"),
    create: (data: Record<string, any>) =>
      request<any>("/admin/templates", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/admin/templates/${id}`, { method: "DELETE" }),
  },

  // ── Ambassador ──
  ambassador: {
    gifts: () => request<any[]>("/ambassador/gifts"),
    claim: (giftId: string) =>
      request<any>(`/ambassador/gifts/${giftId}/claim`, { method: "POST" }),
  },

  // ── Delivery ──
  delivery: {
    submit: (data: Record<string, any>) =>
      request<any>("/delivery-form", { method: "POST", body: JSON.stringify(data) }),
  },

  // ── Admin ──
  admin: {
    stats: () => request<any>("/admin/stats"),
    users: () => request<any[]>("/admin/users"),
    materials: () => request<any[]>("/admin/materials"),
    updateUser: (id: string, data: Record<string, any>) =>
      request<any>(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    settings: () => request<any>("/admin/settings"),
    updateSetting: (key: string, value: any) => request<any>("/admin/settings", { method: "POST", body: JSON.stringify({ key, value }) }),
    createUser: (data: any) => request<any>("/admin/users", { method: "POST", body: JSON.stringify(data) }),
    deleteUser: (id: string) =>
      request<void>(`/admin/users/${id}`, { method: "DELETE" }),
    resetUserPassword: (id: string, password: string) =>
      request<any>(`/admin/users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ password }) }),
    sendAccess: (id: string) =>
      request<{ ok: boolean; url: string; telegram_sent: boolean }>(`/admin/users/${id}/send-access`, { method: "POST" }),
    analytics: () => request<any>("/admin/analytics"),
    deliveryForms: () => request<any[]>("/admin/delivery-forms"),
    exportUsersUrl: () => {
      const token = getToken();
      return `${API_BASE}/admin/users/export${token ? `?token=${token}` : ''}`;
    },
    addAdditionalMaterial: (materialId: string, data: Record<string, any>) =>
      request<any>(`/admin/materials/${materialId}/additional`, { method: "POST", body: JSON.stringify(data) }),
    deleteAdditionalMaterial: (id: string) =>
      request<void>(`/admin/additional/${id}`, { method: "DELETE" }),
    updateMaterial: (id: string, data: Record<string, any>) =>
      request<any>(`/admin/materials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    sections: {
      create: (data: Record<string, any>) =>
        request<any>("/admin/sections", { method: "POST", body: JSON.stringify(data) }),
      update: (id: string, data: Record<string, any>) =>
        request<any>(`/admin/sections/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<void>(`/admin/sections/${id}`, { method: "DELETE" }),
    },
    subsections: {
      create: (data: Record<string, any>) =>
        request<any>("/admin/subsections", { method: "POST", body: JSON.stringify(data) }),
      update: (id: string, data: Record<string, any>) =>
        request<any>(`/admin/subsections/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<void>(`/admin/subsections/${id}`, { method: "DELETE" }),
    },
    invites: {
      list: () => request<any[]>("/admin/invites"),
      create: (data: Record<string, any>) =>
        request<any>("/admin/invites", { method: "POST", body: JSON.stringify(data) }),
      delete: (id: string) =>
        request<void>(`/admin/invites/${id}`, { method: "DELETE" }),
      check: (token: string) => request<any>(`/admin/invites/check/${token}`),
      accept: (token: string) =>
        request<any>(`/admin/invites/accept/${token}`, { method: "POST" }),
    },
  },
};
