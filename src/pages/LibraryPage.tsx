import { useSearchParams } from "react-router-dom";
import MaterialCard from "@/components/MaterialCard";
import { mockMaterials, LIBRARY_SECTIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const LibraryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") || "all";
  const activeSub = searchParams.get("sub") || "all";

  const currentSection = LIBRARY_SECTIONS.find((s) => s.id === activeSection);
  const hasSubsections = currentSection && currentSection.subsections.length > 0;

  const filtered = mockMaterials.filter((m) => {
    if (!m.is_published) return false;
    if (activeSection === "all") return true;
    if (m.section_id !== activeSection) return false;
    if (hasSubsections && activeSub !== "all") {
      return m.subsection_id === activeSub;
    }
    return true;
  });

  const setSection = (id: string) => {
    if (id === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ section: id });
    }
  };

  const setSub = (id: string) => {
    if (id === "all") {
      setSearchParams({ section: activeSection });
    } else {
      setSearchParams({ section: activeSection, sub: id });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold text-foreground">
        Библиотека
      </h1>

      {/* Section tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => setSection("all")}
          className={cn(
            "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeSection === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-muted-foreground hover:bg-muted"
          )}
        >
          Все
        </button>
        {LIBRARY_SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setSection(sec.id)}
            className={cn(
              "flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeSection === sec.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {sec.name}
          </button>
        ))}
      </div>

      {/* Subsection tabs */}
      {hasSubsections && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <button
            onClick={() => setSub("all")}
            className={cn(
              "flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeSub === "all"
                ? "bg-secondary text-secondary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            Все
          </button>
          {currentSection.subsections.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSub(sub.id)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                activeSub === sub.id
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Materials grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((material) => (
          <MaterialCard key={material.id} material={material} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">
            В этом разделе пока нет материалов
          </p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
