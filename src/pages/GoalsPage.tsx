import { useState } from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import HabitCard from "@/components/HabitCard";
import AddHabitDialog from "@/components/AddHabitDialog";
import { mockHabits, mockHabitLogs, type HabitLog } from "@/lib/mock-data";

const GoalsPage = () => {
  const [logs, setLogs] = useState<HabitLog[]>(mockHabitLogs);
  const [dialogOpen, setDialogOpen] = useState(false);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Monthly progress
  const monthLogs = logs.filter((l) => {
    const d = new Date(l.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && l.completed;
  });

  // Expected completions this month (rough estimate)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysPassed = today.getDate();
  const expectedTotal = mockHabits.reduce((sum, h) => {
    if (h.frequency_type === "daily") return sum + daysPassed;
    return sum + Math.ceil((daysPassed / 7) * h.frequency_count);
  }, 0);

  const progressPercent = expectedTotal > 0 ? Math.min(100, Math.round((monthLogs.length / expectedTotal) * 100)) : 0;

  const handleMarkToday = (habitId: string) => {
    const todayStr = today.toISOString().split("T")[0];
    setLogs((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, habit_id: habitId, date: todayStr, completed: true },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-foreground">
            Трекер привычек
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-body">
            Каждый маленький шаг — это уже победа ✨
          </p>
        </div>
        <Button
          className="h-11 gap-2 rounded-xl"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Добавить</span>
        </Button>
      </div>

      {/* Monthly progress */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Прогресс за {today.toLocaleDateString("ru-RU", { month: "long" })}
            </p>
            <p className="text-xs text-muted-foreground">
              Выполнено {progressPercent}% от плана
            </p>
          </div>
          <span className="font-heading text-2xl font-semibold text-primary">
            {progressPercent}%
          </span>
        </div>
        <Progress value={progressPercent} className="h-2.5" />
      </div>

      {/* Habits */}
      <div className="grid gap-4 sm:grid-cols-2">
        {mockHabits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            logs={logs.filter((l) => l.habit_id === habit.id)}
            onMarkToday={handleMarkToday}
          />
        ))}
      </div>

      <AddHabitDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default GoalsPage;
