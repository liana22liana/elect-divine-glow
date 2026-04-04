import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Video, Headphones, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaterial, useSections } from "@/hooks/useApiData";

const MaterialPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isPreview = searchParams.get("preview") === "1";
  const { data: material, isLoading } = useMaterial(id || "");
  const { data: sections = [] } = useSections();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (!isPreview) { setShowOverlay(false); return; }
    // Show overlay after 15 seconds of preview
    setShowOverlay(false);
    const timer = setTimeout(() => setShowOverlay(true), 15000);
    return () => clearTimeout(timer);
  }, [isPreview]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

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

  const section = sections.find((s) => String(s.id) === String(material.section_id));
  const subsection = section?.subsections.find((sub) => String(sub.id) === String(material.subsection_id));
  const additionalMaterials = material.additional_materials || [];

  // Convert YouTube URLs to embed format
  const getEmbedUrl = (url: string) => {
    if (!url) return url;
    // youtube.com/watch?v=ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    // youtu.be/ID
    const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    // youtube.com/shorts/ID
    const shortsMatch = url.match(/(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    // kinescope.io/ID → kinescope.io/embed/ID
    const kinescopeMatch = url.match(/kinescope\.io\/(?!embed\/)([a-zA-Z0-9]+)/);
    if (kinescopeMatch) return `https://kinescope.io/embed/${kinescopeMatch[1]}`;
    // already embed or other
    return url;
  };

  const embedUrl = getEmbedUrl(material.video_url);

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
              src={embedUrl}
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

        <p className="text-base leading-relaxed text-foreground/80 whitespace-pre-line">
          {material.description}
        </p>
      </div>

      {additionalMaterials.map((am) => (
        <div key={am.id} className="space-y-4">
          <div className="h-px bg-border" />
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {am.title}
          </h2>
          {am.description && (
            <p className="text-sm text-foreground/80">{am.description}</p>
          )}
          <div className="relative overflow-hidden rounded-lg bg-muted">
            {am.url ? (
              <div className="aspect-video">
                <iframe
                  src={getEmbedUrl(am.url)}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={am.title}
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  {am.type === "video" ? (
                    <Video className="h-16 w-16" strokeWidth={1} />
                  ) : (
                    <Headphones className="h-16 w-16" strokeWidth={1} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialPage;
