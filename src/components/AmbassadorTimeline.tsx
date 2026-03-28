import { useState } from "react";
import { Check, Lock, Gift } from "lucide-react";
import { AMBASSADOR_MILESTONES, type AmbassadorStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import AmbassadorCongratDialog from "./AmbassadorCongratDialog";

interface AmbassadorTimelineProps {
  currentStatus: AmbassadorStatus | null;
  subscriptionStartDate: string;
  deliveryFormSubmitted: boolean;
}

const STATUS_ORDER: (AmbassadorStatus | null)[] = [null, "rising", "becoming", "transformed", "reborn"];

function getStatusIndex(status: AmbassadorStatus | null): number {
  return STATUS_ORDER.indexOf(status);
}

function daysBetween(a: string, b: string) {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

const AmbassadorTimeline = ({ currentStatus, subscriptionStartDate, deliveryFormSubmitted }: AmbassadorTimelineProps) => {
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const currentIndex = getStatusIndex(currentStatus);
  const today = new Date().toISOString().split("T")[0];
  const totalDays = daysBetween(subscriptionStartDate, today);

  const nextMilestoneIdx = AMBASSADOR_MILESTONES.findIndex(
    (m) => getStatusIndex(m.status) > currentIndex
  );

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
          Путь амбассадора
        </h2>

        {/* Desktop: horizontal */}
        <div className="hidden md:block">
          <div className="relative flex items-start justify-between">
            <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-border" />
            <div
              className="absolute top-5 left-[10%] h-0.5 bg-primary transition-all duration-700"
              style={{
                width: currentIndex >= AMBASSADOR_MILESTONES.length
                  ? "80%"
                  : `${Math.min(80, (currentIndex / (AMBASSADOR_MILESTONES.length - 1)) * 80)}%`,
              }}
            />

            {AMBASSADOR_MILESTONES.map((milestone, idx) => {
              const milestoneStatusIdx = getStatusIndex(milestone.status);
              const isAchieved = milestoneStatusIdx <= currentIndex;
              const isCurrent = milestoneStatusIdx === currentIndex;
              const isFuture = milestoneStatusIdx > currentIndex;

              let progressText = "";
              if (isFuture && idx === nextMilestoneIdx) {
                const targetDays = milestone.months * 30;
                if (totalDays < targetDays) {
                  progressText = `${totalDays} из ${targetDays} дней`;
                }
              }

              return (
                <div key={milestone.status} className="relative z-10 flex flex-col items-center w-1/4">
                  <button
                    onClick={() => isAchieved ? setSelectedMilestone(idx) : null}
                    disabled={isFuture}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                      isAchieved && "border-primary bg-primary text-primary-foreground cursor-pointer hover:scale-110",
                      isCurrent && "animate-pulse border-primary bg-primary text-primary-foreground",
                      isFuture && "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    )}
                  >
                    {isAchieved ? (
                      <Check className="h-5 w-5" strokeWidth={2} />
                    ) : (
                      <Lock className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                  <span className={cn(
                    "mt-2 text-sm font-medium text-center",
                    isAchieved ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {milestone.label}
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">{milestone.months} мес.</span>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Gift className="h-3 w-3" />
                    <span className="text-center">{milestone.gift_description}</span>
                  </div>
                  {progressText && (
                    <span className="mt-1 text-xs font-medium text-primary">{progressText}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-0">
          {AMBASSADOR_MILESTONES.map((milestone, idx) => {
            const milestoneStatusIdx = getStatusIndex(milestone.status);
            const isAchieved = milestoneStatusIdx <= currentIndex;
            const isCurrent = milestoneStatusIdx === currentIndex;
            const isFuture = milestoneStatusIdx > currentIndex;
            const isLast = idx === AMBASSADOR_MILESTONES.length - 1;

            let progressText = "";
            if (isFuture && idx === nextMilestoneIdx) {
              const targetDays = milestone.months * 30;
              if (totalDays < targetDays) {
                progressText = `${totalDays} из ${targetDays} дней`;
              }
            }

            return (
              <div key={milestone.status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => isAchieved ? setSelectedMilestone(idx) : null}
                    disabled={isFuture}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all flex-shrink-0",
                      isAchieved && "border-primary bg-primary text-primary-foreground cursor-pointer",
                      isCurrent && "animate-pulse border-primary bg-primary text-primary-foreground",
                      isFuture && "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    )}
                  >
                    {isAchieved ? (
                      <Check className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                  {!isLast && (
                    <div className={cn(
                      "w-0.5 flex-1 min-h-[2rem]",
                      isAchieved && !isCurrent ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
                <div className="pb-6 pt-1">
                  <span className={cn(
                    "text-sm font-medium",
                    isAchieved ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {milestone.label}
                    <span className="text-xs text-muted-foreground ml-1.5">({milestone.months} мес.)</span>
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Gift className="h-3 w-3" />
                    <span>{milestone.gift_description}</span>
                  </div>
                  {progressText && (
                    <span className="text-xs font-medium text-primary mt-0.5 block">{progressText}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AmbassadorCongratDialog
        milestone={selectedMilestone !== null ? AMBASSADOR_MILESTONES[selectedMilestone] : null}
        open={selectedMilestone !== null}
        onOpenChange={(open) => !open && setSelectedMilestone(null)}
        deliveryFormSubmitted={deliveryFormSubmitted}
      />
    </>
  );
};

export default AmbassadorTimeline;
