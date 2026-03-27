import { useState } from "react";
import {
  Plus, Pencil, Trash2, Video, Headphones, Users as UsersIcon,
  Sparkles, Search, Layers, GripVertical, ChevronDown, ChevronRight,
  Shield, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  mockMaterials, mockUsers, mockHabitTemplates, LIBRARY_SECTIONS,
  AMBASSADOR_MILESTONES, mockAmbassadorGifts,
  type LibrarySection, type LibrarySubsection, type AmbassadorStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type TabId = "materials" | "structure" | "users" | "recommendations";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("materials");
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [recDialogOpen, setRecDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [subsectionDialogOpen, setSubsectionDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [parentSectionId, setParentSectionId] = useState<string | null>(null);

  // Material dialog state
  const [matSectionId, setMatSectionId] = useState("");
  const [matSubsectionId, setMatSubsectionId] = useState("");
  const selectedMatSection = LIBRARY_SECTIONS.find((s) => s.id === matSectionId);

  const tabs = [
    { id: "materials" as const, label: "Материалы", icon: Video },
    { id: "structure" as const, label: "Структура", icon: Layers },
    { id: "users" as const, label: "Участницы", icon: UsersIcon },
    { id: "recommendations" as const, label: "Рекомендации", icon: Sparkles },
  ];

  const filteredTemplates = mockHabitTemplates.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchCat;
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleUser = (id: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Админ-панель
        </h1>
        {activeTab === "materials" && (
          <Button className="h-11 gap-2 rounded-lg" onClick={() => setMaterialDialogOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Добавить
          </Button>
        )}
        {activeTab === "structure" && (
          <Button className="h-11 gap-2 rounded-lg" onClick={() => { setEditingSectionId(null); setSectionDialogOpen(true); }}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Добавить раздел
          </Button>
        )}
        {activeTab === "recommendations" && (
          <Button className="h-11 gap-2 rounded-lg" onClick={() => setRecDialogOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Добавить рекомендацию
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
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

      {/* Materials list */}
      {activeTab === "materials" && (
        <div className="space-y-3">
          {mockMaterials.map((material) => {
            const sec = LIBRARY_SECTIONS.find((s) => s.id === material.section_id);
            return (
              <div
                key={material.id}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                  {material.type === "video" ? (
                    <Video className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  ) : (
                    <Headphones className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-foreground">
                    {material.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {sec?.name} · {new Date(material.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Pencil className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Structure */}
      {activeTab === "structure" && (
        <div className="space-y-2">
          {LIBRARY_SECTIONS.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const hasSubs = section.subsections.length > 0;
            return (
              <div key={section.id} className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                  {hasSubs ? (
                    <button onClick={() => toggleSection(section.id)} className="p-0.5">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  ) : (
                    <div className="w-5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground">{section.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {section.subsections.length > 0
                        ? `${section.subsections.length} подразделов`
                        : "Без подразделов"}
                      {" · "}
                      {mockMaterials.filter((m) => m.section_id === section.id && m.is_published).length} материалов
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => { setParentSectionId(section.id); setSubsectionDialogOpen(true); }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Подраздел
                    </Button>
                    <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
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
                          {mockMaterials.filter((m) => m.subsection_id === sub.id && m.is_published).length} мат.
                        </span>
                        <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <button className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Users list */}
      {activeTab === "users" && (
        <div className="space-y-3">
          {mockUsers.map((user) => {
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
                    <span className="text-sm font-semibold text-primary">
                      {user.name.charAt(0)}
                    </span>
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
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Ambassador status */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Статус амбассадора</Label>
                        <div className="flex items-center gap-2">
                          <Switch checked={user.ambassador_status_override} />
                          <span className="text-xs text-muted-foreground">Присвоить вручную</span>
                        </div>
                        <Select defaultValue={user.ambassador_status || ""}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Авто" />
                          </SelectTrigger>
                          <SelectContent>
                            {AMBASSADOR_MILESTONES.map((m) => (
                              <SelectItem key={m.status} value={m.status}>{m.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* TG invite link */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Ссылка ТГ-канал (подарок 2 мес.)</Label>
                        <div className="flex gap-2">
                          <Input placeholder="https://t.me/+..." className="h-9 text-sm" />
                          <Button variant="outline" size="sm" className="h-9 px-2">
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Content gift 3 months */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Закрытый материал (подарок 3 мес.)</Label>
                        <Select>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Выберите материал" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockMaterials.map((m) => (
                              <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Physical gift status */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Физический подарок</Label>
                        <Select defaultValue={user.delivery_form_submitted ? "submitted" : "not_submitted"}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                className="h-10 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="h-10 w-full sm:w-48">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {LIBRARY_SECTIONS.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredTemplates.map((template) => {
              const sec = LIBRARY_SECTIONS.find((s) => s.id === template.category);
              const material = template.source_content_id
                ? mockMaterials.find((m) => m.id === template.source_content_id)
                : null;
              return (
                <div
                  key={template.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground">{template.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {sec?.name} · {material ? `📎 ${material.title}` : "Без материала"} · {new Date(template.created_at).toLocaleDateString("ru-RU")}
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      Добавили {template.adopted_count} участниц
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => setDeleteId(template.id)}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredTemplates.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Рекомендации не найдены
              </p>
            )}
          </div>
        </div>
      )}

      {/* Material dialog */}
      <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Новый материал</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input placeholder="Название материала" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea placeholder="Описание..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Раздел</Label>
                <Select value={matSectionId} onValueChange={(v) => { setMatSectionId(v); setMatSubsectionId(""); }}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    {LIBRARY_SECTIONS.map((sec) => (
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Тип</Label>
                <Select>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Видео</SelectItem>
                    <SelectItem value="audio">Аудио</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ссылка на видео/аудио</Label>
              <Input placeholder="https://..." className="h-11" />
            </div>

            {/* Additional materials section */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Дополнительные материалы</Label>
                <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Добавить
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Добавьте дополнительные видео или аудио к этому материалу
              </p>
            </div>

            <Button type="button" className="h-11 w-full" onClick={() => setMaterialDialogOpen(false)}>
              Сохранить
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Section dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Новый раздел</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input placeholder="Название раздела" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Иконка</Label>
              <Select>
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
            <Button type="button" className="h-11 w-full" onClick={() => setSectionDialogOpen(false)}>
              Сохранить
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Subsection dialog */}
      <Dialog open={subsectionDialogOpen} onOpenChange={setSubsectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Новый подраздел</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input placeholder="Название подраздела" className="h-11" />
            </div>
            <Button type="button" className="h-11 w-full" onClick={() => setSubsectionDialogOpen(false)}>
              Сохранить
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Recommendation dialog */}
      <Dialog open={recDialogOpen} onOpenChange={setRecDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Новая рекомендация</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Название практики</Label>
              <Input placeholder="Например: Утренняя медитация" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea placeholder="Краткое описание (1-2 предложения)..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Раздел</Label>
              <Select>
                <SelectTrigger className="h-11"><SelectValue placeholder="Выберите раздел" /></SelectTrigger>
                <SelectContent>
                  {LIBRARY_SECTIONS.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Привязка к материалу</Label>
              <Select>
                <SelectTrigger className="h-11"><SelectValue placeholder="Найти материал..." /></SelectTrigger>
                <SelectContent>
                  {mockMaterials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" className="h-11 w-full" onClick={() => setRecDialogOpen(false)}>
              Опубликовать
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить рекомендацию?</AlertDialogTitle>
            <AlertDialogDescription>
              Привычки участниц, добавленные из этой рекомендации, останутся как свои.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => setDeleteId(null)}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
