import { Video, Headphones, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  LIBRARY_SECTIONS, mockLockedContent, mockUser, AMBASSADOR_MILESTONES,
  type Material,
} from "@/lib/mock-data";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_ORDER = [null, "rising", "becoming", "transformed", "reborn"];

interface MaterialCardProps {
  material: Material;
}

const MaterialCard = ({ material }: MaterialCardProps) => {
  const section = LIBRARY_SECTIONS.find((s) => s.id === material.section_id);
  const locked = mockLockedContent.find((lc) => lc.content_id === material.id);
  const userStatusIdx = STATUS_ORDER.indexOf(mockUser.ambassador_status);
  const requiredIdx = locked ? STATUS_ORDER.indexOf(locked.required_status) : -1;
  const isLocked = locked && requiredIdx > userStatusIdx;
  const requiredLabel = isLocked
    ? AMBASSADOR_MILESTONES.find((m) => m.status === locked.required_status)?.label
    : null;

  const card = (
    <div className="group relative block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          {material.type === "video" ? (
            <Video className="h-10 w-10 text-muted-foreground/40" strokeWidth={1} />
          ) : (
            <Headphones className="h-10 w-10 text-muted-foreground/40" strokeWidth={1} />
          )}
        </div>
        <div className="absolute right-3 top-3">
          {material.type === "video" ? (
            <span className="flex items-center gap-1 rounded-full bg-foreground/70 px-2 py-0.5 text-xs text-primary-foreground">
              <Video className="h-3 w-3" strokeWidth={1.5} /> Видео
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-foreground/70 px-2 py-0.5 text-xs text-primary-foreground">
              <Headphones className="h-3 w-3" strokeWidth={1.5} /> Аудио
            </span>
          )}
        </div>
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 backdrop-blur-[2px]">
            <Lock className="h-8 w-8 text-sky" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {material.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          {section && (
            <span className="rounded-full border border-sky/30 bg-sky/[0.15] px-3 py-0.5 text-xs font-medium text-sky">
              {section.name}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(material.created_at).toLocaleDateString("ru-RU")}
          </span>
        </div>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-not-allowed">{card}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Открывается при статусе «{requiredLabel}»</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Link to={`/material/${material.id}`}>
      {card}
    </Link>
  );
};

export default MaterialCard;
