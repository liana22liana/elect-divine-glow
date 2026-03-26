import { Link } from "react-router-dom";
import { Gem, Heart, Sparkles, Brain, Users, Flower2, Moon } from "lucide-react";
import { mockMaterials } from "@/lib/mock-data";

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Gem, Heart, Sparkles, Brain, Users, Flower2, Moon,
};

interface CategoryCardProps {
  id: string;
  label: string;
  icon: string;
}

const CategoryCard = ({ id, label, icon }: CategoryCardProps) => {
  const Icon = iconMap[icon] || Gem;
  const count = mockMaterials.filter((m) => m.category === id && m.is_published).length;

  return (
    <Link
      to={`/library?category=${id}`}
      className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
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
