import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Video, Headphones, Users as UsersIcon,
  Sparkles, Search, Layers, GripVertical, ChevronDown, ChevronRight,
  Shield, Send, Crown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AMBASSADOR_MILESTONES } from "@/lib/types";
import type { AmbassadorStatus, Material, HabitTemplate, LibrarySection, LibrarySubsection, AdminTabId } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  useSections, useAdminMaterials, useAdminUsers, useAdminTemplates,
  useDeleteMaterial, useDeleteTemplate, useCreateMaterial, useUpdateMaterial,
  useCreateSection, useUpdateSection, useDeleteSection,
  useCreateSubsection, useDeleteSubsection,
  useCreateTemplate, useUpdateUser,
} from "@/hooks/useApiData";

type TabId = AdminTabId;

type DeleteTarget = {
  type: "material" | "section" | "subsection" | "template";
  id: string;
  label: string;
};

const DELETE_MESSAGES: Record<DeleteTarget["type"], { title: string; desc: string }> = {
  material: { title: "Удалить материал?", desc: "Материал будет удалён из библиотеки." },
  section: { title: "Удалить раздел?", desc: "Все подразделы и привязки материалов будут потеряны." },
  subsection: { title: "Удалить подраздел?", desc: "Привязки материалов к подразделу будут потеряны." },
  template: { title: "Удалить рекомендацию?", desc: "Привычки участниц, добавленные из этой рекомендации, останутся как свои." },
};

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const isSuperadmin = currentUser?.role === "superadmin";

  const allTabs = [
    { id: "materials" as const, label: "Материалы", icon: Video },
    { id: "structure" as const, label: "Структура", icon: Layers },
    { id: "users" as const, label: "Участницы", icon: UsersIcon },
    { id: "recommendations" as const, label: "Рекомендации", icon: Sparkles },
  ];

  const visibleTabs = isSuperadmin
    ? allTabs
    : allTabs.filter((t) => currentUser?.admin_permissions?.includes(t.id));

  const [activeTab, setActiveTab] = useState<TabId>(visibleTabs[0]?.id || "materials");

  // Dialog states
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [recDialogOpen, setRecDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [subsectionDialogOpen, setSubsectionDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [parentSectionId, setParentSectionId] = useState<string | null>(null);

  // ── Material form state ──
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [matTitle, setMatTitle] = useState("");
  const [matDescription, setMatDescription] = useState("");
  const [matSectionId, setMatSectionId] = useState("");
  const [matSubsectionId, setMatSubsectionId] = useState("");
  const [matType, setMatType] = useState<"video" | "audio">("video");
  const [matVideoUrl, setMatVideoUrl] = useState("");

  // ── Section form state ──
  const [editingSection, setEditingSection] = useState<LibrarySection | null>(null);
  const [secName, setSecName] = useState("");
  const [secIcon, setSecIcon] = useState("");

  // ── Subsection form state ──
  const [subName, setSubName] = useState("");

  // ── Recommendation form state ──
  const [editingTemplate, setEditingTemplate] = useState<HabitTemplate | null>(null);
  const [recTitle, setRecTitle] = useState("");
  const [recDescription, setRecDescription] = useState("");
  const [recCategory, setRecCategory] = useState("");
  const [recSourceId, setRecSourceId] = useState("");

  // ── Data queries ──
  const { data: sections = [], isLoading: loadingSec } = useSections();
  const { data: materials = [], isLoading: loadingMat } = useAdminMaterials();
  const { data: users = [], isLoading: loadingUsers } = useAdminUsers();
  const { data: templates = [], isLoading: loadingTemplates } = useAdminTemplates();

  // ── Mutations ──
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const createSubsection = useCreateSubsection();
  const deleteSubsection = useDeleteSubsection();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const updateUser = useUpdateUser();

  const selectedMatSection = sections.find((s) => s.id === matSectionId);

  const ALL_PERMISSION_TABS: { id: AdminTabId; label: string }[] = [
    { id: "materials", label: "Материалы" },
    { id: "structure", label: "Структура" },
    { id: "users", label: "Участницы" },
    { id: "recommendations", label: "Рекомендации" },
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchCat;
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleUser = (id: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Material dialog helpers ──
  const openMaterialCreate = () => {
    setEditingMaterial(null);
    setMatTitle(""); setMatDescription(""); setMatSectionId(""); setMatSubsectionId("");
    setMatType("video"); setMatVideoUrl("");
    setMaterialDialogOpen(true);
  };

  const openMaterialEdit = (m: Material) => {
    setEditingMaterial(m);
    setMatTitle(m.title); setMatDescription(m.description);
    setMatSectionId(m.section_id); setMatSubsectionId(m.subsection_id || "");
    setMatType(m.type); setMatVideoUrl(m.video_url);
    setMaterialDialogOpen(true);
  };

  const handleMaterialSubmit = () => {
    if (!matTitle.trim() || !matSectionId) {
      toast.error("Заполните название и выберите раздел");
      return;
    }
    const payload = {
      title: matTitle, description: matDescription, section_id: matSectionId,
      subsection_id: matSubsectionId || null, type: matType, video_url: matVideoUrl,
    };
    if (editingMaterial) {
      updateMaterial.mutate({ id: editingMaterial.id, data: payload }, {
        onSuccess: () => { toast.success("Материал обновлён"); setMaterialDialogOpen(false); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      createMaterial.mutate(payload, {
        onSuccess: () => { toast.success("Материал создан"); setMaterialDialogOpen(false); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  // ── Section dialog helpers ──
  const openSectionCreate = () => {
    setEditingSection(null); setSecName(""); setSecIcon("");
    setSectionDialogOpen(true);
  };

  const openSectionEdit = (s: LibrarySection) => {
    setEditingSection(s); setSecName(s.name); setSecIcon(s.icon);
    setSectionDialogOpen(true);
  };

  const handleSectionSubmit = () => {
    if (!secName.trim()) { toast.error("Введите название"); return; }
    const payload = { name: secName, icon: secIcon || "Gem" };
    if (editingSection) {
      updateSection.mutate({ id: editingSection.id, data: payload }, {
        onSuccess: () => { toast.success("Раздел обновлён"); setSectionDialogOpen(false); },
        onError: (e) => toast.error(e.message),
      });
    } else {
      createSection.mutate(payload, {
        onSuccess: () => { toast.success("Раздел создан"); setSectionDialogOpen(false); },
        onError: (e) => toast.error(e.message),
      });
    }
  };

  // ── Subsection dialog helpers ──
  const openSubsectionCreate = (sectionId: string) => {
    setParentSectionId(sectionId); setSubName("");
    setSubsectionDialogOpen(true);
  };

  const handleSubsectionSubmit = () => {
    if (!subName.trim() || !parentSectionId) { toast.error("Введите название"); return; }
    createSubsection.mutate({ name: subName, section_id: parentSectionId }, {
      onSuccess: () => { toast.success("Подраздел создан"); setSubsectionDialogOpen(false); },
      onError: (e) => toast.error(e.message),
    });
  };

  // ── Recommendation dialog helpers ──
  const openRecCreate = () => {
    setEditingTemplate(null); setRecTitle(""); setRecDescription("");
    setRecCategory(""); setRecSourceId("");
    setRecDialogOpen(true);
  };

  const openRecEdit = (t: HabitTemplate) => {
    setEditingTemplate(t); setRecTitle(t.title); setRecDescription(t.description);
    setRecCategory(t.category); setRecSourceId(t.source_content_id || "");
    setRecDialogOpen(true);
  };

  const handleRecSubmit = () => {
    if (!recTitle.trim()) { toast.error("Введите название"); return; }
    const payload = {
      title: recTitle, description: recDescription,
      category: recCategory || null, source_content_id: recSourceId || null,
    };
    createTemplate.mutate(payload, {
      onSuccess: () => { toast.success("Рекомендация создана"); setRecDialogOpen(false); },
      onError: (e) => toast.error(e.message),
    });
  };

  // ── Delete handler ──
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const onSuccess = () => { toast.success("Удалено"); setDeleteTarget(null); };
    const onError = (e: Error) => toast.error(e.message);

    switch (type) {
      case "material": deleteMaterial.mutate(id, { onSuccess, onError }); break;
      case "section": deleteSection.mutate(id, { onSuccess, onError }); break;
      case "subsection": deleteSubsection.mutate(id, { onSuccess, onError }); break;
      case "template": deleteTemplate.mutate(id, { onSuccess, onError }); break;
    }
  };

  // ── User update helper ──
  const handleUpdateUser = (userId: string, data: Record<string, any>) => {
    updateUser.mutate({ id: userId, data }, {
      onSuccess: () => toast.success("Сохранено"),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Админ-панель
        </h1>
        {activeTab === "materials" && (
          <Button className="h-11 gap-2 rounded-lg" onClick={openMaterialCreate}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Добавить
          </Button>
        )}
        {activeTab === "structure" && (
          <Button className="h-11 gap-2 rounded-lg" onClick={openSectionCreate}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Добавить раздел
          </Button>
        )}
        {activeTab === "recommendations" && (
          <Button className="h-11 gap-2 rounded-lg" onClick={openRecCreate}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Добавить рекомендацию
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* ═══════════ Materials list ═══════════ */}
      {activeTab === "materials" && (
        <div className="space-y-3">
          {loadingMat ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
          ) : (
            materials.map((material) => {
              const sec = sections.find((s) => s.id === material.section_id);
              return (
                <div key={material.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    {material.type === "video" ? (
                      <Video className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                    ) : (
                      <Headphones className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-foreground">{material.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {sec?.name} · {new Date(material.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      onClick={() => openMaterialEdit(material)}
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => setDeleteTarget({ type: "material", id: material.id, label: material.title })}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══════════ Structure ═══════════ */}
      {activeTab === "structure" && (
        <div className="space-y-2">
          {loadingSec ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
          ) : (
            sections.map((section) => {
              const isExpanded = expandedSections.has(section.id);
              const hasSubs = section.subsections.length > 0;
              return (
                <div key={section.id} className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                    {hasSubs ? (
                      <button onClick={() => toggleSection(section.id)} className="p-0.5">
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    ) : <div className="w-5" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground">{section.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {section.subsections.length > 0 ? `${section.subsections.length} подразделов` : "Без подразделов"}
                        {" · "}
                        {materials.filter((m) => m.section_id === section.id && m.is_published).length} материалов
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => openSubsectionCreate(section.id)}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Подраздел
                      </Button>
                      <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" onClick={() => openSectionEdit(section)}>
                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                      <button className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setDeleteTarget({ type: "section", id: section.id, label: section.name })}>
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                  {hasSubs && isExpanded && (
                    <div className="border-t border-border bg-muted/30 px-4 py-2 space-y-1">
                      {section.subsections.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50">
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />
                          <span className="flex-1 text-sm text-foreground">{sub.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {materials.filter((m) => m.subsection_id === sub.id && m.is_published).length} мат.
                          </span>
                          <button className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setDeleteTarget({ type: "subsection", id: sub.id, label: sub.name })}>
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══════════ Users list ═══════════ */}
      {activeTab === "users" && (
        <div className="space-y-3">
          {loadingUsers ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
          ) : (
            users.map((user) => {
              const isExpanded = expandedUsers.has(user.id);
              const statusLabel = AMBASSADOR_MILESTONES.find((m) => m.status === user.ambassador_status)?.label;
              const subColor = user.subscription_status === "active" ? "bg-green-500"
                : user.subscription_status === "paused" ? "bg-yellow-500" : "bg-destructive";
              const subLabel = user.subscription_status === "active" ? "Активна"
                : user.subscription_status === "paused" ? "Приостановлена" : "Отменена";

              return (
                <div key={user.id} className="rounded-lg border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => toggleUser(user.id)}
                    className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">{user.name.charAt(0)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-foreground">{user.name}</h3>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusLabel && (
                        <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          <Shield className="h-3 w-3" />
                          {statusLabel}
                          {user.ambassador_status_override && " (вручную)"}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${subColor}`} />
                        <span className="text-xs text-muted-foreground">{subLabel}</span>
                      </div>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Статус амбассадора</Label>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.ambassador_status_override}
                              onCheckedChange={(checked) => handleUpdateUser(user.id, { ambassador_status_override: checked })}
                            />
                            <span className="text-xs text-muted-foreground">Присвоить вручную</span>
                          </div>
                          <Select
                            defaultValue={user.ambassador_status || ""}
                            onValueChange={(val) => handleUpdateUser(user.id, { ambassador_status: val as AmbassadorStatus })}
                          >
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Авто" /></SelectTrigger>
                            <SelectContent>
                              {AMBASSADOR_MILESTONES.map((m) => (
                                <SelectItem key={m.status} value={m.status}>{m.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Ссылка ТГ-канал (подарок 2 мес.)</Label>
                          <UserTgLinkField userId={user.id} onSave={handleUpdateUser} />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Закрытый материал (подарок 3 мес.)</Label>
                          <Select onValueChange={(val) => handleUpdateUser(user.id, { gift_content_id: val })}>
                            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Выберите материал" /></SelectTrigger>
                            <SelectContent>
                              {materials.map((m) => (
                                <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Физический подарок</Label>
                          <Select
                            defaultValue={user.delivery_form_submitted ? "submitted" : "not_submitted"}
                            onValueChange={(val) => handleUpdateUser(user.id, { delivery_status: val })}
                          >
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not_submitted">Форма не заполнена</SelectItem>
                              <SelectItem value="submitted">Форма заполнена</SelectItem>
                              <SelectItem value="sent">Отправлен</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Дата вступления: {new Date(user.created_at).toLocaleDateString("ru-RU")}
                      </p>

                      {/* ── Superadmin: role management ── */}
                      {isSuperadmin && (
                        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">Управление доступом</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Label className="text-xs text-muted-foreground min-w-[60px]">Роль</Label>
                            <Select
                              value={user.role || "user"}
                              onValueChange={(val) => handleUpdateUser(user.id, { role: val })}
                            >
                              <SelectTrigger className="h-9 text-sm w-48"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Пользователь</SelectItem>
                                <SelectItem value="admin">Админ</SelectItem>
                                <SelectItem value="superadmin">Суперадмин</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {(user.role === "admin") && (
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Доступные разделы</Label>
                              <div className="flex flex-wrap gap-3">
                                {ALL_PERMISSION_TABS.map((tab) => {
                                  const perms: AdminTabId[] = user.admin_permissions || [];
                                  const checked = perms.includes(tab.id);
                                  return (
                                    <label key={tab.id} className="flex items-center gap-2 cursor-pointer">
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(c) => {
                                          const next = c
                                            ? [...perms, tab.id]
                                            : perms.filter((p) => p !== tab.id);
                                          handleUpdateUser(user.id, { admin_permissions: next });
                                        }}
                                      />
                                      <span className="text-sm text-foreground">{tab.label}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══════════ Recommendations ═══════════ */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Поиск по названию..." className="h-10 pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-10 w-full sm:w-48"><SelectValue placeholder="Категория" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {sections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {loadingTemplates ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)
            ) : (
              filteredTemplates.map((template) => {
                const sec = sections.find((s) => s.id === template.category);
                const material = template.source_content_id ? materials.find((m) => m.id === template.source_content_id) : null;
                return (
                  <div key={template.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-foreground">{template.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {sec?.name} · {material ? `📎 ${material.title}` : "Без материала"} · {new Date(template.created_at).toLocaleDateString("ru-RU")}
                      </p>
                      <p className="text-xs text-secondary mt-0.5">Добавили {template.adopted_count} участниц</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" onClick={() => openRecEdit(template)}>
                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                      <button className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setDeleteTarget({ type: "template", id: template.id, label: template.title })}>
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            {!loadingTemplates && filteredTemplates.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">Рекомендации не найдены</p>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ Material dialog ═══════════ */}
      <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingMaterial ? "Редактировать материал" : "Новый материал"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleMaterialSubmit(); }}>
            <div className="space-y-2">
              <Label>Название</Label>
              <Input placeholder="Название материала" className="h-11" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea placeholder="Описание..." rows={4} value={matDescription} onChange={(e) => setMatDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Раздел</Label>
                <Select value={matSectionId} onValueChange={(v) => { setMatSectionId(v); setMatSubsectionId(""); }}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    {sections.map((sec) => (
                      <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Подраздел</Label>
                <Select value={matSubsectionId} onValueChange={setMatSubsectionId} disabled={!selectedMatSection || selectedMatSection.subsections.length === 0}>
                  <SelectTrigger className="h-11"><SelectValue placeholder={selectedMatSection?.subsections.length ? "Выберите" : "—"} /></SelectTrigger>
                  <SelectContent>
                    {selectedMatSection?.subsections.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Тип</Label>
              <Select value={matType} onValueChange={(v) => setMatType(v as "video" | "audio")}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Видео</SelectItem>
                  <SelectItem value="audio">Аудио</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ссылка на видео/аудио</Label>
              <Input placeholder="https://..." className="h-11" value={matVideoUrl} onChange={(e) => setMatVideoUrl(e.target.value)} />
            </div>
            <Button type="submit" className="h-11 w-full" disabled={createMaterial.isPending || updateMaterial.isPending}>
              {(createMaterial.isPending || updateMaterial.isPending) ? "Сохранение..." : "Сохранить"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════ Section dialog ═══════════ */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingSection ? "Редактировать раздел" : "Новый раздел"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSectionSubmit(); }}>
            <div className="space-y-2">
              <Label>Название</Label>
              <Input placeholder="Название раздела" className="h-11" value={secName} onChange={(e) => setSecName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Иконка</Label>
              <Select value={secIcon} onValueChange={setSecIcon}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Выберите иконку" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gem">💎 Gem</SelectItem>
                  <SelectItem value="Heart">❤️ Heart</SelectItem>
                  <SelectItem value="Sparkles">✨ Sparkles</SelectItem>
                  <SelectItem value="Brain">🧠 Brain</SelectItem>
                  <SelectItem value="Users">👥 Users</SelectItem>
                  <SelectItem value="Flower2">🌸 Flower</SelectItem>
                  <SelectItem value="Moon">🌙 Moon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="h-11 w-full" disabled={createSection.isPending || updateSection.isPending}>
              {(createSection.isPending || updateSection.isPending) ? "Сохранение..." : "Сохранить"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════ Subsection dialog ═══════════ */}
      <Dialog open={subsectionDialogOpen} onOpenChange={setSubsectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Новый подраздел</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubsectionSubmit(); }}>
            <div className="space-y-2">
              <Label>Название</Label>
              <Input placeholder="Название подраздела" className="h-11" value={subName} onChange={(e) => setSubName(e.target.value)} />
            </div>
            <Button type="submit" className="h-11 w-full" disabled={createSubsection.isPending}>
              {createSubsection.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════ Recommendation dialog ═══════════ */}
      <Dialog open={recDialogOpen} onOpenChange={setRecDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingTemplate ? "Редактировать рекомендацию" : "Новая рекомендация"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleRecSubmit(); }}>
            <div className="space-y-2">
              <Label>Название практики</Label>
              <Input placeholder="Например: Утренняя медитация" className="h-11" value={recTitle} onChange={(e) => setRecTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea placeholder="Краткое описание (1-2 предложения)..." rows={3} value={recDescription} onChange={(e) => setRecDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Раздел</Label>
              <Select value={recCategory} onValueChange={setRecCategory}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Выберите раздел" /></SelectTrigger>
                <SelectContent>
                  {sections.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Привязка к материалу</Label>
              <Select value={recSourceId} onValueChange={setRecSourceId}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Найти материал..." /></SelectTrigger>
                <SelectContent>
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="h-11 w-full" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? "Сохранение..." : "Опубликовать"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════ Universal delete confirmation ═══════════ */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteTarget ? DELETE_MESSAGES[deleteTarget.type].title : ""}</AlertDialogTitle>
            <AlertDialogDescription>{deleteTarget ? DELETE_MESSAGES[deleteTarget.type].desc : ""}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Small helper component for TG link input per user
const UserTgLinkField = ({ userId, onSave }: { userId: string; onSave: (id: string, data: Record<string, any>) => void }) => {
  const [link, setLink] = useState("");
  return (
    <div className="flex gap-2">
      <Input placeholder="https://t.me/+..." className="h-9 text-sm" value={link} onChange={(e) => setLink(e.target.value)} />
      <Button variant="outline" size="sm" className="h-9 px-2" onClick={() => { if (link.trim()) onSave(userId, { tg_invite_link: link }); }}>
        <Send className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export default AdminPage;
