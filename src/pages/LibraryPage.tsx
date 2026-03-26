import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import MaterialCard from "@/components/MaterialCard";
import { mockMaterials, CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const LibraryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  const filtered = activeCategory === "all"
    ? mockMaterials.filter((m) => m.is_published)
    : mockMaterials.filter((m) => m.is_published && m.category === activeCategory);

  const setCategory = (id: string) => {
    if (id === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: id });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold text-foreground">
        Библиотека
      </h1>

      {/* Category filters */}
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => setCategory("all")}
          className={cn(
            "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          Все
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Materials grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">
            В этой категории пока нет материалов
          </p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
