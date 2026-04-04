import { Video, Headphones, Lock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { AMBASSADOR_MILESTONES } from "@/lib/types";
import type { Material } from "@/lib/types";
import { useSections } from "@/hooks/useApiData";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_ORDER: (string | null)[] = [null, "rising", "becoming", "transformed", "reborn"];

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
  watched?: boolean;
}

// Extract YouTube video ID from any URL format
const getYoutubeThumbnail = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  }
  return null;
};

const MaterialCard = ({ material, previewEnabled = false, watched = false }: MaterialCardProps) => {
  const { data: sections = [] } = useSections();
  const { user } = useAuth();
  const section = sections.find((s) => s.id === material.section_id);
  
  // Check if material requires ambassador status
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const userStatusIdx = user?.ambassador_status ? STATUS_ORDER.indexOf(user.ambassador_status) : 0;
  const requiredStatusIdx = material.required_ambassador_status ? STATUS_ORDER.indexOf(material.required_ambassador_status) : 0;
  const isLocked = !isAdmin && material.required_ambassador_status && userStatusIdx < requiredStatusIdx;
  const requiredMilestone = AMBASSADOR_MILESTONES.find(m => m.status === material.required_ambassador_status);
  const requiredLabel = requiredMilestone?.label || null;

  // Thumbnail: explicit > YouTube auto > null
  const thumbnailUrl = material.thumbnail_url || getYoutubeThumbnail(material.video_url) || null;

  const gradient = SECTION_GRADIENTS[material.section_id] || SECTION_GRADIENTS.practices;

  const linkTo = previewEnabled
    ? `/material/${material.id}?preview=1`
    : `/material/${material.id}`;

  if (!previewEnabled) {
    const listRow = (
      <div className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:shadow-sm hover:border-primary/20">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}>
          {material.type === "video" ? (
            <Video className="h-5 w-5 text-foreground/60" strokeWidth={1.5} />
          ) : (
            <Headphones className="h-5 w-5 text-foreground/60" strokeWidth={1.5} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-sm text-foreground group-hover:text-primary transition-colors">
            {material.title}
          </h3>
        </div>
        {section && (
          <span className="hidden sm:inline-flex flex-shrink-0 rounded-full border border-secondary/30 bg-secondary/[0.12] px-2.5 py-0.5 text-xs font-medium text-secondary">
            {section.name}
          </span>
        )}
        <span className="flex-shrink-0 text-xs text-muted-foreground">
          {new Date(material.created_at).toLocaleDateString("ru-RU")}
        </span>
        {watched && !isLocked && <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" strokeWidth={1.5} />}
        {isLocked && <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground" strokeWidth={1.5} />}
      </div>
    );

    if (isLocked) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-not-allowed">{listRow}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Открывается при статусе «{requiredLabel}»</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <Link to={`/material/${material.id}`}>{listRow}</Link>;
  }

  const card = (
    <div className="group relative block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20">
      <div className={`relative aspect-video bg-gradient-to-br ${gradient}`}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={material.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
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
        )}
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
        {watched && !isLocked && (
          <div className="absolute left-3 top-3">
            <CheckCircle className="h-5 w-5 text-green-500 drop-shadow" strokeWidth={2} />
          </div>
        )}
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

  return <Link to={linkTo}>{card}</Link>;
};

export default MaterialCard;
