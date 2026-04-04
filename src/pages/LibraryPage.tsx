import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MaterialCard from "@/components/MaterialCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Eye } from "lucide-react";
import { useMaterials, useSections } from "@/hooks/useApiData";
import { useAuth } from "@/contexts/AuthContext";
import { AMBASSADOR_MILESTONES } from "@/lib/types";
import type { AmbassadorStatus } from "@/lib/types";
import { Lock, Gift } from "lucide-react";

const LibraryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get("section") || "all";
  const activeSub = searchParams.get("sub") || "all";
  const { user } = useAuth();

  const PREVIEW_KEY = `preview_${user?.id || "anon"}`;
  const [previewEnabled, setPreviewEnabled] = useState(() => {
    return localStorage.getItem(PREVIEW_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(PREVIEW_KEY, String(previewEnabled));
  }, [previewEnabled, PREVIEW_KEY]);

  const { data: sections = [], isLoading: loadingSec } = useSections();
  const { data: materials = [], isLoading: loadingMat } = useMaterials();

  const currentSection = sections.find((s) => String(s.id) === activeSection);
  const hasSubsections = currentSection && currentSection.subsections.length > 0;

  const filtered = materials.filter((m) => {
    if (!m.is_published) return false;
    // Exclude bonus (ambassador-locked) materials from main list — they show in bonus section
    if (activeSection === "all" && m.required_ambassador_status) return false;
    if (activeSection === "all") return true;
    if (String(m.section_id) !== activeSection) return false;
    if (hasSubsections && activeSub !== "all") {
      return String(m.subsection_id) === activeSub;
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
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Библиотека
        </h1>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Eye className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm text-muted-foreground">Превью</span>
          <Switch checked={previewEnabled} onCheckedChange={setPreviewEnabled} />
        </label>
      </div>

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
        {loadingSec
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)
          : sections.map((sec) => (
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
      {loadingMat ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className={previewEnabled ? "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
          {filtered.map((material) => (
            <MaterialCard key={material.id} material={material} previewEnabled={previewEnabled} />
          ))}
        </div>
      )}

      {!loadingMat && filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">
            В этом разделе пока нет материалов
          </p>
        </div>
      )}

      {/* Бонусы амбассадора */}
      {activeSection === "all" && (() => {
        const bonusMaterials = materials.filter(m => m.is_published && m.required_ambassador_status);
        if (bonusMaterials.length === 0) return null;

        const statusOrder: AmbassadorStatus[] = ['rising', 'becoming', 'transformed', 'reborn'];
        const userStatus = user?.ambassador_status;
        const userIdx = userStatus ? statusOrder.indexOf(userStatus) : -1;
        const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

        return (
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Gift className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-foreground">Бонусы амбассадора</h2>
                <p className="text-xs text-muted-foreground">Эксклюзивные материалы за верность клубу ✨</p>
              </div>
            </div>
            <div className={previewEnabled ? "grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}>
              {bonusMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} previewEnabled={previewEnabled} />
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
};

export default LibraryPage;
