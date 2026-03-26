import { useState } from "react";
import { Plus, Pencil, Trash2, Video, Headphones, Users as UsersIcon } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockMaterials, mockUsers, CATEGORIES, type Material } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<"materials" | "users">("materials");
  const [dialogOpen, setDialogOpen] = useState(false);

  const tabs = [
    { id: "materials" as const, label: "Материалы", icon: Video },
    { id: "users" as const, label: "Участницы", icon: UsersIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Админ-панель
        </h1>
        {activeTab === "materials" && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 gap-2 rounded-lg">
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Добавить
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  Новый материал
                </DialogTitle>
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
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Выберите" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Тип</Label>
                    <Select>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Выберите" />
                      </SelectTrigger>
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
                <Button type="button" className="h-11 w-full" onClick={() => setDialogOpen(false)}>
                  Сохранить
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
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
    </div>
  );
};

export default AdminPage;
