import { Link } from "react-router-dom";
import { Gem, Heart, Sparkles, Brain, Users, Flower2, Moon, type LucideIcon } from "lucide-react";
import { useMaterials } from "@/hooks/useApiData";

const iconMap: Record<string, LucideIcon> = {
  Gem, Heart, Sparkles, Brain, Users, Flower2, Moon,
};

const CATEGORY_COLORS: Record<string, string> = {
  money: "bg-amber-100 text-amber-600",
  relationships: "bg-rose-100 text-rose-500",
  reality: "bg-fuchsia-100 text-fuchsia-500",
  mindset: "bg-violet-100 text-violet-500",
  experts: "bg-orange-100 text-orange-500",
  body: "bg-emerald-100 text-emerald-500",
  practices: "bg-sky-100 text-sky-500",
};

interface CategoryCardProps {
  id: string;
  label: string;
  icon: string;
}

const CategoryCard = ({ id, label, icon }: CategoryCardProps) => {
  const Icon = iconMap[icon] || Gem;
  const { data: materials = [] } = useMaterials();
  const count = materials.filter((m) => m.section_id === id && m.is_published).length;
  const colors = CATEGORY_COLORS[id] || "bg-secondary/15 text-secondary";

  return (
    <Link
      to={`/library?section=${id}`}
      className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:scale-[1.02]"
    >
      <div className={`flex h-14 w-14 items-center justify-center rounded-full ${colors}`}>
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h3 className="text-center font-heading text-base font-semibold text-foreground leading-tight">
        {label}
      </h3>
      <span className="text-xs text-muted-foreground">
        {count} {count === 1 ? "материал" : "материалов"}
      </span>
    </Link>
  );
};

export default CategoryCard;
