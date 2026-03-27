import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MaterialCard from "@/components/MaterialCard";
import CategoryCard from "@/components/CategoryCard";
import { mockMaterials, mockUser, LIBRARY_SECTIONS } from "@/lib/mock-data";

const HomePage = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const latestMaterials = mockMaterials
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
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-foreground lg:text-4xl">
          Добро пожаловать, {mockUser.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Рада видеть тебя в клубе ✨
        </p>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold text-foreground">
            Новое в клубе
          </h2>
          <div className="hidden gap-2 lg:flex">
            <button
              onClick={() => scroll("left")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
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
          {latestMaterials.map((material) => (
            <div key={material.id} className="w-72 flex-shrink-0 snap-start">
              <MaterialCard material={material} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-heading text-2xl font-semibold text-foreground">
          Разделы
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {LIBRARY_SECTIONS.map((sec) => (
            <CategoryCard key={sec.id} id={sec.id} label={sec.name} icon={sec.icon} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
