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
const TARGET_DAYS = [60, 90, 180, 365];

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
  const totalDays = Math.max(0, daysBetween(subscriptionStartDate, today));

  const nextMilestoneIdx = AMBASSADOR_MILESTONES.findIndex(
    (m) => getStatusIndex(m.status) > currentIndex
  );

  // Calculate desktop progress bar width as percentage of 80% track
  const calcDesktopProgressWidth = () => {
    const segments = AMBASSADOR_MILESTONES.length - 1; // 3 segments between 4 nodes
    if (segments <= 0) return 0;
    const segmentWidth = 80 / segments;

    if (nextMilestoneIdx === -1) return 80; // all achieved

    // Fully completed segments
    const completedSegments = nextMilestoneIdx > 0 ? nextMilestoneIdx - 1 : 0;
    // But we need segments where BOTH endpoints are achieved
    // Actually: achieved milestones count = number of milestones with statusIdx <= currentIndex
    // The first achieved-to-next segment needs partial fill
    
    // Count achieved milestones (0-indexed)
    let achievedCount = 0;
    for (let i = 0; i < AMBASSADOR_MILESTONES.length; i++) {
      if (getStatusIndex(AMBASSADOR_MILESTONES[i].status) <= currentIndex) {
        achievedCount = i + 1;
      }
    }

    // Full segments = achievedCount - 1 (segments between achieved nodes)
    const fullSegments = Math.max(0, achievedCount - 1);
    
    // Partial segment: from last achieved to next milestone
    let partialFraction = 0;
    if (nextMilestoneIdx >= 0 && nextMilestoneIdx < AMBASSADOR_MILESTONES.length) {
      const targetDays = TARGET_DAYS[nextMilestoneIdx];
      const prevTargetDays = nextMilestoneIdx > 0 ? TARGET_DAYS[nextMilestoneIdx - 1] : 0;
      const daysInSegment = targetDays - prevTargetDays;
      const daysProgress = totalDays - prevTargetDays;
      partialFraction = Math.max(0, Math.min(1, daysProgress / daysInSegment));
    }

    return (fullSegments + partialFraction) * segmentWidth;
  };

  // Calculate mobile segment fill percentage between idx and idx+1
  const calcMobileSegmentFill = (idx: number): number => {
    const thisAchieved = getStatusIndex(AMBASSADOR_MILESTONES[idx].status) <= currentIndex;
    const nextAchieved = idx + 1 < AMBASSADOR_MILESTONES.length && getStatusIndex(AMBASSADOR_MILESTONES[idx + 1].status) <= currentIndex;

    if (thisAchieved && nextAchieved) return 100;
    if (!thisAchieved) return 0;

    // This is achieved but next is not — partial fill
    const targetDays = TARGET_DAYS[idx + 1];
    const prevTargetDays = TARGET_DAYS[idx];
    const daysInSegment = targetDays - prevTargetDays;
    const daysProgress = totalDays - prevTargetDays;
    return Math.max(0, Math.min(100, (daysProgress / daysInSegment) * 100));
  };

  const desktopProgressWidth = calcDesktopProgressWidth();

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-6">
          Путь амбассадора
        </h2>

        {/* Desktop: horizontal */}
        <div className="hidden md:block">
          <div className="relative flex items-start justify-between">
            {/* Background track */}
            <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-border" />
            {/* Filled progress */}
            <div
              className="absolute top-5 left-[10%] h-0.5 bg-primary transition-all duration-700"
              style={{ width: `${desktopProgressWidth}%` }}
            />

            {AMBASSADOR_MILESTONES.map((milestone, idx) => {
              const milestoneStatusIdx = getStatusIndex(milestone.status);
              const isAchieved = milestoneStatusIdx <= currentIndex;
              const isFuture = milestoneStatusIdx > currentIndex;
              const isNext = idx === nextMilestoneIdx;

              let progressText = "";
              if (isNext) {
                const targetDays = TARGET_DAYS[idx];
                const displayDays = Math.min(totalDays, targetDays);
                if (totalDays < targetDays) {
                  progressText = `${displayDays} дней из ${targetDays}`;
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
                      isNext && "animate-pulse border-primary bg-primary/20 text-primary",
                      isFuture && !isNext && "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
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
            const isFuture = milestoneStatusIdx > currentIndex;
            const isNext = idx === nextMilestoneIdx;
            const isLast = idx === AMBASSADOR_MILESTONES.length - 1;

            let progressText = "";
            if (isNext) {
              const targetDays = TARGET_DAYS[idx];
              const displayDays = Math.min(totalDays, targetDays);
              if (totalDays < targetDays) {
                progressText = `${displayDays} дней из ${targetDays}`;
              }
            }

            const segmentFill = !isLast ? calcMobileSegmentFill(idx) : 0;

            return (
              <div key={milestone.status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => isAchieved ? setSelectedMilestone(idx) : null}
                    disabled={isFuture}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all flex-shrink-0",
                      isAchieved && "border-primary bg-primary text-primary-foreground cursor-pointer",
                      isNext && "animate-pulse border-primary bg-primary/20 text-primary",
                      isFuture && !isNext && "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    )}
                  >
                    {isAchieved ? (
                      <Check className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                  {!isLast && (
                    <div className="relative w-0.5 flex-1 min-h-[2rem] bg-border overflow-hidden">
                      <div
                        className="absolute top-0 left-0 w-full bg-primary transition-all duration-500"
                        style={{ height: `${segmentFill}%` }}
                      />
                    </div>
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
