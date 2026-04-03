import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MaterialCard from "@/components/MaterialCard";
import CategoryCard from "@/components/CategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useMaterials, useSections } from "@/hooks/useApiData";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: materials = [], isLoading: loadingMat } = useMaterials();
  const { data: sections = [], isLoading: loadingSec } = useSections();
  const { user } = useAuth();

  const latestMaterials = [...materials]
    .filter((m) => m.is_published)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -280 : 280,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-foreground lg:text-4xl">
          Добро пожаловать{user?.name ? `, ${user.name}` : ", Избранная Женщина"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Рада видеть тебя в клубе ✨
        </p>
      </div>

      <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Новое в клубе
          </h2>
          <div className="hidden gap-2 lg:flex">
            <button
              onClick={() => scroll("left")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-200 hover:bg-muted hover:scale-105"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-200 hover:bg-muted hover:scale-105"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loadingMat
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-72 flex-shrink-0 snap-start">
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
              ))
            : latestMaterials.map((material, i) => (
                <div
                  key={material.id}
                  className="w-72 flex-shrink-0 snap-start animate-slide-up"
                  style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                >
                  <MaterialCard material={material} previewEnabled={true} />
                </div>
              ))}
        </div>
      </section>

      <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
          Разделы
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {loadingSec
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))
            : sections.map((sec, i) => (
                <div key={sec.id} className="animate-fade-in" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
                  <CategoryCard id={sec.id} label={sec.name} icon={sec.icon} />
                </div>
              ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
