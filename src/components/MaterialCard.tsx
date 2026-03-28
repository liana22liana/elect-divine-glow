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

const SECTION_GRADIENTS: Record<string, string> = {
  money: "from-amber-100 via-yellow-50 to-orange-50",
  relationships: "from-rose-100 via-pink-50 to-red-50",
  reality: "from-fuchsia-100 via-purple-50 to-violet-50",
  mindset: "from-violet-100 via-indigo-50 to-blue-50",
  experts: "from-orange-100 via-amber-50 to-yellow-50",
  body: "from-emerald-100 via-green-50 to-teal-50",
  practices: "from-sky-100 via-blue-50 to-cyan-50",
};

interface MaterialCardProps {
  material: Material;
  previewEnabled?: boolean;
}

const MaterialCard = ({ material, previewEnabled = false }: MaterialCardProps) => {
  const section = LIBRARY_SECTIONS.find((s) => s.id === material.section_id);
  const locked = mockLockedContent.find((lc) => lc.content_id === material.id);
  const userStatusIdx = STATUS_ORDER.indexOf(mockUser.ambassador_status);
  const requiredIdx = locked ? STATUS_ORDER.indexOf(locked.required_status) : -1;
  const isLocked = locked && requiredIdx > userStatusIdx;
  const requiredLabel = isLocked
    ? AMBASSADOR_MILESTONES.find((m) => m.status === locked.required_status)?.label
    : null;

  const gradient = SECTION_GRADIENTS[material.section_id] || SECTION_GRADIENTS.practices;

  const card = (
    <div className="group relative block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <div className={`relative aspect-video bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          {material.type === "video" ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card/80 shadow-md backdrop-blur-sm">
              <Video className="h-7 w-7 text-foreground/60" strokeWidth={1.5} />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card/80 shadow-md backdrop-blur-sm">
              <Headphones className="h-7 w-7 text-foreground/60" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="absolute right-3 top-3">
          {material.type === "video" ? (
            <span className="flex items-center gap-1 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
              <Video className="h-3 w-3" strokeWidth={1.5} /> Видео
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
              <Headphones className="h-3 w-3" strokeWidth={1.5} /> Аудио
            </span>
          )}
        </div>
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 backdrop-blur-[2px]">
            <Lock className="h-8 w-8 text-secondary" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {material.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          {section && (
            <span className="rounded-full border border-secondary/30 bg-secondary/[0.12] px-3 py-0.5 text-xs font-medium text-secondary">
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

  const linkTo = previewEnabled
    ? `/material/${material.id}?preview=1`
    : `/material/${material.id}`;

  return (
    <Link to={linkTo}>
      {card}
    </Link>
  );
};

export default MaterialCard;
