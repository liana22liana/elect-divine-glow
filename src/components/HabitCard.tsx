import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Flame, ExternalLink, Gem, Heart, Sparkles, Brain, Users, Flower2, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LIBRARY_SECTIONS, type Habit, type HabitLog } from "@/lib/mock-data";
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

const CATEGORY_DOT_COLORS: Record<string, string> = {
  money: "bg-amber-400",
  relationships: "bg-rose-400",
  reality: "bg-fuchsia-400",
  mindset: "bg-violet-400",
  experts: "bg-orange-400",
  body: "bg-emerald-400",
  practices: "bg-sky-400",
};

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  onMarkToday: (habitId: string) => void;
}

function getStreak(logs: HabitLog[]): number {
  const sorted = [...logs]
    .filter((l) => l.completed)
    .map((l) => l.date)
    .sort()
    .reverse();
  if (sorted.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
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

function getLast28Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

const HabitCard = ({ habit, logs, onMarkToday }: HabitCardProps) => {
  const [animating, setAnimating] = useState(false);
  const Icon = categoryIcons[habit.category || "practices"] || Sparkles;
  const section = LIBRARY_SECTIONS.find((s) => s.id === habit.category);
  const sectionLabel = section?.name || habit.category || "";
  const streak = getStreak(logs);
  const completedDates = new Set(logs.filter((l) => l.completed).map((l) => l.date));
  const today = new Date().toISOString().split("T")[0];
  const markedToday = completedDates.has(today);
  const last28 = getLast28Days();
  const totalCompleted = logs.filter((l) => l.completed).length;
  const dotColor = CATEGORY_DOT_COLORS[habit.category || "practices"] || "bg-primary";

  const frequencyLabel =
    habit.frequency_type === "daily"
      ? "Каждый день"
      : `${habit.frequency_count} раз в неделю`;

  const handleMark = () => {
    if (markedToday) return;
    setAnimating(true);
    onMarkToday(habit.id);
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4 transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground leading-tight">
              {habit.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {sectionLabel} · {frequencyLabel}
            </p>
          </div>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary shadow-sm shadow-primary/20">
            <Flame className="h-4 w-4" />
            {streak}
          </div>
        )}
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

      {habit.deadline && habit.total_target ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Выполнено {totalCompleted} из {habit.total_target}</span>
            <span>до {new Date(habit.deadline).toLocaleDateString("ru-RU")}</span>
          </div>
          <Progress
            value={(totalCompleted / habit.total_target) * 100}
            className="h-2"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Последние 4 недели · выполнено {totalCompleted}
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {last28.map((date) => (
              <div
                key={date}
                className={cn(
                  "h-5 w-5 rounded-full transition-colors mx-auto",
                  completedDates.has(date) ? dotColor : "bg-muted"
                )}
                title={date}
              />
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleMark}
        disabled={markedToday}
        className={cn(
          "h-11 w-full gap-2 rounded-xl font-body transition-all",
          animating && "animate-scale-in",
          markedToday && "opacity-60"
        )}
      >
        <Check className="h-4 w-4" strokeWidth={2} />
        {markedToday ? "Отмечено сегодня ✓" : "Отметить сегодня"}
      </Button>
    </div>
  );
};

export default HabitCard;
