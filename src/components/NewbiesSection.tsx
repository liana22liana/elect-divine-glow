import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NewbieItem {
  id: number;
  title: string;
  content: string;
  emoji: string;
  order_index: number;
  link?: string;
  link_label?: string;
}

function AccordionItem({ item }: { item: NewbieItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/30"
      >
        <span className="font-medium text-foreground">{item.title}</span>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        }
      </button>
      {open && (
        <div className="bg-muted/20 px-5 pb-4 pt-1 space-y-3">
          <p className="text-sm leading-relaxed text-foreground/75 whitespace-pre-line">{item.content}</p>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" />
              {item.link_label || "Перейти"}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function NewbiesSection() {
  const [expanded, setExpanded] = useState(false);
  const { data: items = [], isLoading } = useQuery<NewbieItem[]>({
    queryKey: ["newbies"],
    queryFn: () => fetch("/api/newbies").then(r => r.json()),
  });

  if (isLoading || !items.length) return null;

  return (
    <section className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/30"
      >
        <div className="text-left">
          <p className="font-heading font-semibold text-foreground">Для новеньких</p>
          <p className="text-xs text-muted-foreground mt-0.5">Всё что нужно знать в начале пути</p>
        </div>
        {expanded
          ? <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
          : <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
        }
      </button>

      {expanded && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card animate-fade-in">
          {items.map(item => <AccordionItem key={item.id} item={item} />)}
        </div>
      )}
    </section>
  );
}
