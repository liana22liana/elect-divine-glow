import { useState } from "react";
import { Plus, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import HabitCard from "@/components/HabitCard";
import AddHabitDialog from "@/components/AddHabitDialog";
import EditHabitDialog from "@/components/EditHabitDialog";
import { useHabits, useAllHabitLogs, useToggleHabitLog, useDeleteHabit } from "@/hooks/useApiData";
import type { Habit, HabitLog } from "@/lib/types";

function toDateStr(d: string | Date): string {
  return new Date(d).toISOString().split("T")[0];
}

const GoalsPage = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const { data: habits = [], isLoading: loadingHabits } = useHabits();
  const habitIds = habits.map((h) => h.id);
  const { data: logs = [], isLoading: loadingLogs } = useAllHabitLogs(habitIds);
  const toggleLog = useToggleHabitLog();
  const deleteHabit = useDeleteHabit();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const dayOfMonth = today.getDate();

  // Calculate month progress
  const monthLogs = logs.filter((l) => {
    const d = new Date(toDateStr(l.date));
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && l.completed;
  });

  const expectedTotal = habits.reduce((sum, h) => {
    if (h.frequency_type === "daily") return sum + dayOfMonth;
    return sum + Math.ceil((dayOfMonth / 7) * h.frequency_count);
  }, 0);

  const progressPercent = expectedTotal > 0 ? Math.min(100, Math.round((monthLogs.length / expectedTotal) * 100)) : 0;

  // Current streak across all habits (longest)
  const todayStr = today.toISOString().split("T")[0];
  const todayCompleted = habits.filter((h) => {
    const habitLogs = logs.filter((l) => l.habit_id === h.id && l.completed);
    return habitLogs.some((l) => toDateStr(l.date) === todayStr);
  }).length;

  const handleToggleDay = (habitId: string, date: string, completed: boolean) => {
    toggleLog.mutate({ habitId, date, completed });
  };

  const handleDelete = (habitId: string) => {
    deleteHabit.mutate(habitId);
  };

  const loading = loadingHabits || loadingLogs;

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
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Добавить</span>
        </Button>
      </div>

      {/* Monthly summary */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground capitalize">
              {today.toLocaleDateString("ru-RU", { month: "long" })}
            </p>
            <p className="text-xs text-muted-foreground">
              {monthLogs.length} выполнений · {progressPercent}% от плана
            </p>
          </div>
          <span className="font-heading text-2xl font-semibold text-primary">
            {progressPercent}%
          </span>
        </div>
        <Progress value={progressPercent} className="h-2.5" />

        {/* Today's quick stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
          <span>Сегодня: {todayCompleted} / {habits.length} привычек</span>
          {habits.length > 0 && todayCompleted === habits.length && (
            <span className="flex items-center gap-1 text-primary font-medium">
              <Flame className="h-3 w-3" />
              Все выполнено!
            </span>
          )}
        </div>
      </div>

      {/* Habit cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
            <Target className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Пока нет привычек
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Добавь первую привычку и начни отслеживать свой прогресс
          </p>
          <Button
            className="h-11 gap-2 rounded-xl mt-2"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Добавить привычку
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={logs.filter((l) => l.habit_id === habit.id)}
              onToggleDay={handleToggleDay}
              onDelete={handleDelete}
              onEdit={(h) => setEditingHabit(h)}
            />
          ))}
        </div>
      )}

      <AddHabitDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditHabitDialog
        habit={editingHabit}
        open={editingHabit !== null}
        onOpenChange={(open) => !open && setEditingHabit(null)}
      />
    </div>
  );
};

export default GoalsPage;
