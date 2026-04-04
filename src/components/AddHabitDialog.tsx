import { useState } from "react";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSections, usePublicTemplates, useMaterials, useCreateHabit } from "@/hooks/useApiData";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddHabitDialog = ({ open, onOpenChange }: AddHabitDialogProps) => {
  const [title, setTitle] = useState("");
  const [frequencyMode, setFrequencyMode] = useState<"daily" | "weekly" | "custom">("daily");
  const [customCount, setCustomCount] = useState([3]);
  const [hasDeadline, setHasDeadline] = useState(false);
  const [deadline, setDeadline] = useState<Date>();
  const [totalTarget, setTotalTarget] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: sections = [] } = useSections();
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const { data: templates = [] } = usePublicTemplates();
  const { data: materials = [] } = useMaterials();
  const createHabit = useCreateHabit();

  const resetForm = () => {
    setTitle("");
    setFrequencyMode("daily");
    setCustomCount([3]);
    setHasDeadline(false);
    setDeadline(undefined);
    setTotalTarget("");
    setSelectedTemplate(null);
  };

  const handleAdd = () => {
    createHabit.mutate({
      title,
      frequency_type: frequencyMode === "custom" ? "weekly" : frequencyMode,
      frequency_count: frequencyMode === "custom" ? customCount[0] : frequencyMode === "daily" ? 1 : 1,
      deadline: hasDeadline && deadline ? deadline.toISOString().split("T")[0] : null,
      total_target: hasDeadline && totalTarget ? parseInt(totalTarget) : null,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Добавить привычку
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="custom" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="custom">Своя</TabsTrigger>
            <TabsTrigger value="club">Из клуба</TabsTrigger>
            <TabsTrigger value="library">Из библиотеки</TabsTrigger>
          </TabsList>

          <TabsContent value="custom" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                placeholder="Например: Утренняя зарядка"
                className="h-11"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Частота</Label>
              <Select
                value={frequencyMode}
                onValueChange={(v) => setFrequencyMode(v as "daily" | "weekly" | "custom")}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Каждый день</SelectItem>
                  <SelectItem value="weekly">Раз в неделю</SelectItem>
                  <SelectItem value="custom">Несколько раз в неделю</SelectItem>
                </SelectContent>
              </Select>
              {frequencyMode === "custom" && (
                <div className="space-y-2 px-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Раз в неделю</span>
                    <span className="font-medium text-foreground">{customCount[0]}</span>
                  </div>
                  <Slider
                    min={2}
                    max={6}
                    step={1}
                    value={customCount}
                    onValueChange={setCustomCount}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Дедлайн</Label>
                <Switch checked={hasDeadline} onCheckedChange={setHasDeadline} />
              </div>
              {hasDeadline && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">До даты</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 w-full justify-start text-left font-normal",
                            !deadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deadline ? format(deadline, "dd.MM.yyyy") : "Выбрать"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={deadline}
                          onSelect={setDeadline}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Всего раз</Label>
                    <Input
                      type="number"
                      placeholder="12"
                      className="h-11"
                      value={totalTarget}
                      onChange={(e) => setTotalTarget(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button className="h-11 w-full rounded-xl" onClick={handleAdd}>
              Добавить
            </Button>
          </TabsContent>

          <TabsContent value="club" className="space-y-3 pt-2">
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Все разделы" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все разделы</SelectItem>
                {sections.map((sec) => (
                  <SelectItem key={sec.id} value={String(sec.id)}>{sec.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {templates.filter((t) => templateFilter === "all" || String(t.category) === templateFilter).map((template) => {
              const section = sections.find((s) => String(s.id) === String(template.category));
              const material = template.source_content_id
                ? materials.find((m) => String(m.id) === String(template.source_content_id))
                : null;

              return (
                <div
                  key={template.id}
                  className="rounded-xl border border-border bg-card p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-heading text-base font-semibold text-foreground">
                        {template.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {template.description}
                      </p>
                    </div>
                    {section && (
                      <span className="flex-shrink-0 rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                        {section.name}
                      </span>
                    )}
                  </div>
                  {material && (
                    <p className="text-xs text-secondary">
                      📎 {material.title}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-full gap-1.5 rounded-lg"
                    onClick={() => {
                      createHabit.mutate({
                        title: template.title,
                        template_id: template.id,
                        frequency_type: "daily",
                        frequency_count: 1,
                        category: template.category,
                        source_content_id: template.source_content_id,
                      });
                      onOpenChange(false);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Добавить в мои цели
                  </Button>
                </div>
              );
            })}
            {templates.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Пока нет рекомендаций от клуба</p>
            )}
          </TabsContent>
          <TabsContent value="library" className="space-y-3 pt-2">
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Все разделы" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все разделы</SelectItem>
                {sections.map((sec) => (
                  <SelectItem key={sec.id} value={String(sec.id)}>{sec.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {materials
              .filter((m) => m.is_published)
              .filter((m) => templateFilter === "all" || String(m.section_id) === templateFilter)
              .map((material) => {
                const section = sections.find((s) => String(s.id) === String(material.section_id));
                const subsection = section?.subsections?.find(
                  (sub) => String(sub.id) === String(material.subsection_id)
                );
                return (
                  <div
                    key={material.id}
                    className="rounded-xl border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-heading text-base font-semibold text-foreground">
                          {material.title}
                        </h4>
                        {material.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {material.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {section && (
                          <span className="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                            {section.name}
                          </span>
                        )}
                        {subsection && (
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                            {subsection.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{material.type === "video" ? "🎬 Видео" : "🎧 Аудио"}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-full gap-1.5 rounded-lg"
                      onClick={() => {
                        createHabit.mutate({
                          title: material.title,
                          frequency_type: "daily",
                          frequency_count: 1,
                          category: material.section_id,
                          source_content_id: material.id,
                        });
                        onOpenChange(false);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Добавить в мои цели
                    </Button>
                  </div>
                );
              })}
            {materials.filter((m) => m.is_published).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">В библиотеке пока нет материалов</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddHabitDialog;
