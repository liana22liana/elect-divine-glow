const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:3000/api"
  : "/api";

// Safari-safe token storage: localStorage with sessionStorage fallback
export function getToken(): string | null {
  try {
    return localStorage.getItem("elect_token") || sessionStorage.getItem("elect_token");
  } catch {
    return sessionStorage.getItem("elect_token");
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem("elect_token", token);
  } catch {}
  try {
    sessionStorage.setItem("elect_token", token);
  } catch {}
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

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name: string) =>
      request<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      }),
    me: () => request<any>("/auth/me"),
    // New magic link endpoint (one-time token from magic_links table)
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

  profile: {
    get: () => request<any>("/profile"),
    update: (data: Record<string, any>) =>
      request<any>("/profile", { method: "PUT", body: JSON.stringify(data) }),
  },

  sections: {
    list: () => request<any[]>("/sections"),
  },

  materials: {
    list: (params?: Record<string, any>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/materials${q}`);
    },
    get: (id: number) => request<any>(`/materials/${id}`),
    markWatched: (id: number) =>
      request<any>(`/materials/${id}/watched`, { method: "POST" }),
    unmarkWatched: (id: number) =>
      request<any>(`/materials/${id}/watched`, { method: "DELETE" }),
    getProgress: () => request<any[]>("/materials/progress"),
    timecodes: (id: string) => request<any[]>(`/materials/${id}/timecodes`),
  },

  habits: {
    list: () => request<any[]>("/habits"),
    create: (data: any) =>
      request<any>("/habits", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      request<any>(`/habits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<void>(`/habits/${id}`, { method: "DELETE" }),
    toggle: (id: number, date: string) =>
      request<any>(`/habits/${id}/toggle`, { method: "POST", body: JSON.stringify({ date }) }),
    templates: () => request<any[]>("/habits/templates"),
  },

  ambassador: {
    status: () => request<any>("/ambassador/status"),
  },

  delivery: {
    submit: (data: any) =>
      request<any>("/delivery-form", { method: "POST", body: JSON.stringify(data) }),
  },

  admin: {
    stats: () => request<any>("/admin/stats"),
    users: () => request<any[]>("/admin/users"),
    createUser: (data: any) =>
      request<any>("/admin/users", { method: "POST", body: JSON.stringify(data) }),
    updateUser: (id: number, data: any) =>
      request<any>(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    materials: () => request<any[]>("/admin/materials"),
    createMaterial: (data: any) =>
      request<any>("/admin/materials", { method: "POST", body: JSON.stringify(data) }),
    updateMaterial: (id: number, data: any) =>
      request<any>(`/admin/materials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteMaterial: (id: number) =>
      request<void>(`/admin/materials/${id}`, { method: "DELETE" }),
    sections: () => request<any[]>("/admin/sections"),
    createSection: (data: any) =>
      request<any>("/admin/sections", { method: "POST", body: JSON.stringify(data) }),
    updateSection: (id: number, data: any) =>
      request<any>(`/admin/sections/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteSection: (id: number) =>
      request<void>(`/admin/sections/${id}`, { method: "DELETE" }),
    subsections: (sectionId?: number) => {
      const q = sectionId ? `?section_id=${sectionId}` : "";
      return request<any[]>(`/admin/subsections${q}`);
    },
    invites: () => request<any[]>("/admin/invites"),
    createInvite: (data: any) =>
      request<any>("/admin/invites", { method: "POST", body: JSON.stringify(data) }),
    deleteInvite: (id: number) =>
      request<void>(`/admin/invites/${id}`, { method: "DELETE" }),
    deliveryForms: () => request<any[]>("/admin/delivery-forms"),
    exportUsers: () => `${API_BASE}/admin/users/export`,
    getTimecodes: (materialId: number) => request<any[]>(`/admin/materials/${materialId}/timecodes`),
    createTimecode: (materialId: number, data: any) => request<any>(`/admin/materials/${materialId}/timecodes`, { method: "POST", body: JSON.stringify(data) }),
    updateTimecode: (id: number, data: any) => request<any>(`/admin/timecodes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteTimecode: (id: number) => request<void>(`/admin/timecodes/${id}`, { method: "DELETE" }),
    settings: () => request<any>("/admin/settings"),
    updateSetting: (key: string, value: any) =>
      request<any>("/admin/settings", { method: "POST", body: JSON.stringify({ key, value }) }),
  },
};
