import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LibrarySection, Material, Habit, HabitLog, HabitTemplate, UserProfile, AdminInvite } from "@/lib/types";

// ── Sections ──
export const useSections = () =>
  useQuery<LibrarySection[]>({
    queryKey: ["sections"],
    queryFn: api.sections.list,
  });

// ── Materials ──
export const useMaterials = (params?: { section_id?: string; subsection_id?: string }) =>
  useQuery<Material[]>({
    queryKey: ["materials", params],
    queryFn: () => api.materials.list(params),
  });

export const useMaterial = (id: string) =>
  useQuery<Material>({
    queryKey: ["material", id],
    queryFn: () => api.materials.get(id),
    enabled: !!id,
  });

// ── Progress ──
export const useMaterialProgress = () =>
  useQuery<{ material_id: string; watched_at: string }[]>({
    queryKey: ["materialProgress"],
    queryFn: api.materials.progress,
  });

export const useMarkWatched = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.materials.markWatched(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materialProgress"] }),
  });
};

export const useUnmarkWatched = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.materials.unmarkWatched(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materialProgress"] }),
  });
};

// ── Profile ──
export const useProfile = () =>
  useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: api.profile.get,
  });

// ── Habits ──
export const useHabits = () =>
  useQuery<Habit[]>({
    queryKey: ["habits"],
    queryFn: api.habits.list,
  });

export const useHabitLogs = (habitId: string) =>
  useQuery<HabitLog[]>({
    queryKey: ["habitLogs", habitId],
    queryFn: () => api.habits.logs(habitId),
    enabled: !!habitId,
  });

export const useAllHabitLogs = (habitIds: string[]) =>
  useQuery<HabitLog[]>({
    queryKey: ["habitLogs", "all", habitIds],
    queryFn: async () => {
      const results = await Promise.all(habitIds.map((id) => api.habits.logs(id)));
      return results.flat();
    },
    enabled: habitIds.length > 0,
  });

// ── Mutations ──

export const useCreateHabit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.habits.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
};

export const useDeleteHabit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.habits.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
};

export const useMarkHabitLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      api.habits.markLog(habitId, date),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habitLogs"] }),
  });
};

export const useToggleHabitLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ habitId, date, completed }: { habitId: string; date: string; completed: boolean }) =>
      api.habits.toggleLog(habitId, date, completed),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habitLogs"] }),
  });
};

export const useUpdateHabit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.habits.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
};

// ── Admin ──

export const useAdminUsers = () =>
  useQuery<UserProfile[]>({
    queryKey: ["admin", "users"],
    queryFn: api.admin.users,
  });

export const useAdminStats = () =>
  useQuery({
    queryKey: ["admin", "stats"],
    queryFn: api.admin.stats,
  });

export const useAdminDeliveryForms = () =>
  useQuery({
    queryKey: ["admin", "deliveryForms"],
    queryFn: api.admin.deliveryForms,
  });

export const useAdminMaterials = () =>
  useQuery<Material[]>({
    queryKey: ["admin", "materials"],
    queryFn: () => api.admin.materials(),
  });

export const useAdminTemplates = () =>
  useQuery<HabitTemplate[]>({
    queryKey: ["admin", "templates"],
    queryFn: api.templates.list,
  });

export const usePublicTemplates = () =>
  useQuery<HabitTemplate[]>({
    queryKey: ["templates", "public"],
    queryFn: api.habits.templates,
  });

// ── Admin Mutations ──

export const useCreateMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.materials.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["admin", "materials"] });
    },
  });
};

export const useUpdateMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.materials.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["admin", "materials"] });
    },
  });
};

export const useDeleteMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.materials.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["admin", "materials"] });
    },
  });
};

// ── Sections CRUD ──

export const useCreateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.admin.sections.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
};

export const useUpdateSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.admin.sections.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
};

export const useDeleteSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.sections.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
};

// ── Subsections CRUD ──

export const useCreateSubsection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.admin.subsections.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
};

export const useUpdateSubsection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.admin.subsections.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
};

export const useDeleteSubsection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.subsections.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
};

// ── Templates ──

export const useCreateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.templates.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "templates"] }),
  });
};

export const useDeleteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.templates.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "templates"] }),
  });
};

// ── Users ──

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      api.admin.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

// ── Invites ──

export const useAdminInvites = () =>
  useQuery<AdminInvite[]>({
    queryKey: ["admin", "invites"],
    queryFn: api.admin.invites.list,
  });

export const useCreateInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => api.admin.invites.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "invites"] }),
  });
};

export const useDeleteInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.invites.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "invites"] }),
  });
};

// ── Additional Materials ──

export const useAddAdditionalMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ materialId, data }: { materialId: string; data: Record<string, any> }) =>
      api.admin.addAdditionalMaterial(materialId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["admin", "materials"] });
      qc.invalidateQueries({ queryKey: ["material"] });
    },
  });
};

export const useDeleteAdditionalMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.admin.deleteAdditionalMaterial(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
      qc.invalidateQueries({ queryKey: ["admin", "materials"] });
      qc.invalidateQueries({ queryKey: ["material"] });
    },
  });
};
