import { useState } from "react";
import { Plus, Pencil, Trash2, Video, Headphones, Users as UsersIcon, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { mockMaterials, mockUsers, mockHabitTemplates, CATEGORIES, type HabitTemplate } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type TabId = "materials" | "users" | "recommendations";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("materials");
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [recDialogOpen, setRecDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const tabs = [
    { id: "materials" as const, label: "Материалы", icon: Video },
    { id: "users" as const, label: "Участницы", icon: UsersIcon },
    { id: "recommendations" as const, label: "Рекомендации", icon: Sparkles },
  ];

  const filteredTemplates = mockHabitTemplates.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchCat;
  });

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
            const cat = CATEGORIES.find((c) => c.id === material.category);
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
                    {cat?.label} · {new Date(material.created_at).toLocaleDateString("ru-RU")}
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

      {/* Users list */}
      {activeTab === "users" && (
        <div className="space-y-3">
          {mockUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
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
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("ru-RU")}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      user.subscription_active ? "bg-green-500" : "bg-destructive"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {user.subscription_active ? "Активна" : "Неактивна"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          {/* Filters */}
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
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <div className="space-y-3">
            {filteredTemplates.map((template) => {
              const cat = CATEGORIES.find((c) => c.id === template.category);
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
                      {cat?.label} · {material ? `📎 ${material.title}` : "Без материала"} · {new Date(template.created_at).toLocaleDateString("ru-RU")}
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
                <Label>Категория</Label>
                <Select>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Выберите" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <Button type="button" className="h-11 w-full" onClick={() => setMaterialDialogOpen(false)}>
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
              <Label>Категория</Label>
              <Select>
                <SelectTrigger className="h-11"><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
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
