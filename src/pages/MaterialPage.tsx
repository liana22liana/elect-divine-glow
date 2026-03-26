import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Video, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockMaterials, CATEGORIES } from "@/lib/mock-data";

const MaterialPage = () => {
  const { id } = useParams();
  const material = mockMaterials.find((m) => m.id === id);

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

  const category = CATEGORIES.find((c) => c.id === material.category);

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
      <div className="overflow-hidden rounded-lg bg-muted">
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
      </div>

      {/* Info */}
      <div className="space-y-4">
        <h1 className="font-heading text-2xl font-semibold text-foreground lg:text-3xl">
          {material.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          {category && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {category.label}
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
    </div>
  );
};

export default MaterialPage;
