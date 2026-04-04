import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useUpdateHabit } from "@/hooks/useApiData";
import type { Habit } from "@/lib/types";

interface EditHabitDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditHabitDialog = ({ habit, open, onOpenChange }: EditHabitDialogProps) => {
  const [title, setTitle] = useState("");
  const [frequencyMode, setFrequencyMode] = useState<"daily" | "weekly" | "custom">("daily");
  const [customCount, setCustomCount] = useState([3]);
  const updateHabit = useUpdateHabit();

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      if (habit.frequency_type === "daily") {
        setFrequencyMode("daily");
      } else if (habit.frequency_count === 1) {
        setFrequencyMode("weekly");
      } else {
        setFrequencyMode("custom");
        setCustomCount([habit.frequency_count]);
      }
    }
  }, [habit]);

  const handleSave = () => {
    if (!habit) return;
    updateHabit.mutate({
      id: habit.id,
      data: {
        title,
        frequency_type: frequencyMode === "custom" ? "weekly" : frequencyMode,
        frequency_count: frequencyMode === "custom" ? customCount[0] : frequencyMode === "daily" ? 1 : 1,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Редактировать привычку
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input
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

          <Button className="h-11 w-full rounded-xl" onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditHabitDialog;
