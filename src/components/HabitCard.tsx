import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check, Flame, ExternalLink, Gem, Heart, Sparkles,
  Brain, Users, Flower2, Moon, Trash2, Pencil, Trophy,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Habit, HabitLog } from "@/lib/types";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ElementType> = {
  money: Gem,
  relationships: Heart,
  reality: Sparkles,
  mindset: Brain,
  experts: Users,
  body: Flower2,
  practices: Moon,
};

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  onToggleDay: (habitId: string, date: string, completed: boolean) => void;
  onDelete?: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
}

/** Normalize any date string to YYYY-MM-DD */
function toDateStr(d: string | Date): string {
  return new Date(d).toISOString().split("T")[0];
}

function getStreak(logs: HabitLog[]): number {
  const sorted = [...logs]
    .filter((l) => l.completed)
    .map((l) => toDateStr(l.date))
    .sort()
    .reverse();
  if (sorted.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split("T")[0];
    if (sorted.includes(ds)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

function getBestStreak(logs: HabitLog[]): number {
  const sorted = [...logs]
    .filter((l) => l.completed)
    .map((l) => toDateStr(l.date))
    .sort();
  if (sorted.length === 0) return 0;

  let best = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      best = Math.max(best, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return best;
}

/** Get Monday-Sunday for a given week offset (0 = current) */
function getWeekDays(weekOffset: number = 0): string[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function getMonthCompletionPercent(logs: HabitLog[], habit: Habit): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = now.getDate();

  const monthLogs = logs.filter((l) => {
    const d = new Date(toDateStr(l.date));
    return d.getFullYear() === year && d.getMonth() === month && l.completed;
  });

  let expected: number;
  if (habit.frequency_type === "daily") {
    expected = dayOfMonth;
  } else {
    const weeksPassed = Math.ceil(dayOfMonth / 7);
    expected = weeksPassed * habit.frequency_count;
  }

  return expected > 0 ? Math.min(100, Math.round((monthLogs.length / expected) * 100)) : 0;
}

const HabitCard = ({ habit, logs, onToggleDay, onDelete, onEdit }: HabitCardProps) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const Icon = categoryIcons[habit.category || "practices"] || Sparkles;
  const streak = getStreak(logs);
  const bestStreak = getBestStreak(logs);
  const completedDates = new Set(logs.filter((l) => l.completed).map((l) => toDateStr(l.date)));
  const today = new Date().toISOString().split("T")[0];
  const weekDays = getWeekDays(weekOffset);
  const monthPercent = getMonthCompletionPercent(logs, habit);

  // Weekly habits: count completions this week
  const currentWeekDays = getWeekDays(0);
  const weekCompletions = currentWeekDays.filter((d) => completedDates.has(d)).length;

  const isDaily = habit.frequency_type === "daily";
  const frequencyLabel = isDaily
    ? "Каждый день"
    : `${habit.frequency_count} раз в неделю`;

  const handleToggle = (date: string) => {
    // Only allow toggling today and past 7 days
    const dayDate = new Date(date);
    const todayDate = new Date(today);
    const diffDays = (todayDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays < 0 || diffDays > 7) return; // can't mark future or too old

    const isCompleted = completedDates.has(date);
    onToggleDay(habit.id, date, !isCompleted);
  };

  // Check if a day is tappable
  const isTappable = (date: string) => {
    const dayDate = new Date(date);
    const todayDate = new Date(today);
    const diffDays = (todayDate.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };

  // Week label
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];
  const formatShortDate = (ds: string) => {
    const d = new Date(ds);
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  const weekLabel = weekOffset === 0 ? "Эта неделя" : `${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)}`;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 transition-all duration-200 hover:shadow-md hover:border-primary/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-semibold text-foreground leading-tight truncate">
              {habit.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {frequencyLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-sm font-medium text-primary">
              <Flame className="h-3.5 w-3.5" />
              {streak}
            </div>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(habit)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {habit.source_content_id && (
        <Link
          to={`/material/${habit.source_content_id}`}
          className="flex items-center gap-1.5 text-xs text-secondary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Перейти к материалу
        </Link>
      )}

      {/* Weekly progress for weekly habits */}
      {!isDaily && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">На этой неделе</span>
            {weekCompletions >= habit.frequency_count ? (
              <span className="font-medium text-primary">Выполнено ✓</span>
            ) : (
              <span className="font-medium text-foreground">
                {weekCompletions} / {habit.frequency_count}
              </span>
            )}
          </div>
          <Progress value={Math.min(100, (weekCompletions / habit.frequency_count) * 100)} className="h-2" />
        </div>
      )}

      {/* Deadline progress */}
      {habit.deadline && habit.total_target && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Выполнено {logs.filter((l) => l.completed).length} из {habit.total_target}</span>
            <span>до {new Date(habit.deadline).toLocaleDateString("ru-RU")}</span>
          </div>
          <Progress
            value={(logs.filter((l) => l.completed).length / habit.total_target) * 100}
            className="h-2"
          />
        </div>
      )}

      {/* Week calendar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground font-medium">{weekLabel}</span>
          <button
            onClick={() => setWeekOffset((w) => Math.min(w + 1, 0))}
            disabled={weekOffset >= 0}
            className={cn(
              "p-1 rounded-lg transition-colors",
              weekOffset >= 0
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((date, i) => {
            const completed = completedDates.has(date);
            const isToday = date === today;
            const canTap = isTappable(date);
            const isFuture = new Date(date) > new Date(today);

            return (
              <button
                key={date}
                onClick={() => canTap && handleToggle(date)}
                disabled={!canTap}
                className="flex flex-col items-center gap-1"
              >
                <span className={cn(
                  "text-[10px] font-medium",
                  isToday ? "text-primary" : "text-muted-foreground"
                )}>
                  {DAY_LABELS[i]}
                </span>
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                  completed && "bg-primary text-primary-foreground shadow-sm shadow-primary/30",
                  !completed && canTap && "bg-muted hover:bg-primary/20 cursor-pointer",
                  !completed && !canTap && "bg-muted/50 opacity-40",
                  isToday && !completed && "ring-2 ring-primary/30",
                  isFuture && "opacity-30"
                )}>
                  {completed ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <span className={cn(
                      "text-xs",
                      isToday ? "text-primary font-semibold" : "text-muted-foreground"
                    )}>
                      {new Date(date).getDate()}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-amber-500" />
            <span>Рекорд: {bestStreak} {bestStreak === 1 ? "день" : bestStreak < 5 ? "дня" : "дней"}</span>
          </div>
          <span>Месяц: {monthPercent}%</span>
        </div>

        {/* Delete */}
        {onDelete && (
          showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-destructive">Удалить?</span>
              <button
                className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => { onDelete(habit.id); setShowDeleteConfirm(false); }}
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default HabitCard;
