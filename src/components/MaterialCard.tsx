import { Video, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { LIBRARY_SECTIONS, type Material } from "@/lib/mock-data";

interface MaterialCardProps {
  material: Material;
}

const MaterialCard = ({ material }: MaterialCardProps) => {
  const section = LIBRARY_SECTIONS.find((s) => s.id === material.section_id);

  return (
    <Link
      to={`/material/${material.id}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
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
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
          {material.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          {section && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              {section.name}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(material.created_at).toLocaleDateString("ru-RU")}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MaterialCard;
