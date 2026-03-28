import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Video, Headphones, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockMaterials, LIBRARY_SECTIONS } from "@/lib/mock-data";

const MaterialPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isPreview = searchParams.get("preview") === "1";
  const material = mockMaterials.find((m) => m.id === id);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!isPreview) { setShowOverlay(false); return; }
    const timer = setTimeout(() => setShowOverlay(true), 15000);
    setShowOverlay(true); // show immediately with option to dismiss
    return () => clearTimeout(timer);
  }, [isPreview]);

  if (!material) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">Материал не найден</p>
        <Link to="/library" className="mt-4 text-primary underline">
          Вернуться в библиотеку
        </Link>
      </div>
    );
  }

  const section = LIBRARY_SECTIONS.find((s) => s.id === material.section_id);
  const subsection = section?.subsections.find((sub) => sub.id === material.subsection_id);
  const additionalMaterials = material.additional_materials || [];

  return (
    <div className="space-y-6">
      <Link
        to="/library"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Назад к библиотеке
      </Link>

      {/* Player */}
      <div className="relative overflow-hidden rounded-lg bg-muted">
        {material.type === "video" && material.video_url ? (
          <div className="aspect-video">
            <iframe
              src={material.video_url}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={material.title}
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              {material.type === "video" ? (
                <Video className="h-16 w-16" strokeWidth={1} />
              ) : (
                <Headphones className="h-16 w-16" strokeWidth={1} />
              )}
              <p className="text-sm">
                {material.type === "video" ? "Видео скоро будет доступно" : "Аудио плеер"}
              </p>
            </div>
          </div>
        )}

        {/* Preview overlay */}
        {isPreview && showOverlay && (
          <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-medium text-primary-foreground">
                Это превью — нажмите для полного просмотра
              </p>
              <Button
                onClick={() => navigate(`/material/${id}`, { replace: true })}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {material.type === "video" ? "Смотреть полностью" : "Слушать полностью"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground lg:text-3xl">
          {material.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {section && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {section.name}
            </span>
          )}
          {subsection && (
            <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
              {subsection.name}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {new Date(material.created_at).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <p className="text-base leading-relaxed text-foreground/80">
          {material.description}
        </p>
      </div>

      {/* Additional materials */}
      {additionalMaterials.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Дополнительные материалы
          </h2>
          <div className="space-y-2">
            {additionalMaterials.map((am) => (
              <div
                key={am.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  {am.type === "video" ? (
                    <Video className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  ) : (
                    <Headphones className="h-4 w-4 text-primary" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {am.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {am.type === "video" ? "Видео" : "Аудио"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <Play className="h-4 w-4 text-primary" strokeWidth={1.5} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialPage;
