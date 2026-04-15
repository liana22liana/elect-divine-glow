import { Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Timecode {
  id: number;
  time_seconds: number;
  label: string;
  order_index: number;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface TimecodesProps {
  materialId: string | number;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  videoUrl: string;
}

export function Timecodes({ materialId, iframeRef, videoUrl }: TimecodesProps) {
  const { data: timecodes = [] } = useQuery<Timecode[]>({
    queryKey: ["timecodes", materialId],
    queryFn: () => api.materials.timecodes(String(materialId)),
    enabled: !!materialId,
  });

  if (!timecodes.length) return null;

  const isKinescope = videoUrl?.includes("kinescope");
  const isYoutube = videoUrl?.includes("youtube") || videoUrl?.includes("youtu.be");

  const seekTo = (seconds: number) => {
    if (!iframeRef.current) return;
    if (isYoutube) {
      // YouTube postMessage API
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
        "*"
      );
    } else if (isKinescope) {
      // Kinescope postMessage API
      iframeRef.current.contentWindow?.postMessage(
        { method: "seek", value: seconds },
        "*"
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Clock className="h-4 w-4 text-primary" />
        Содержание
      </div>
      <div className="space-y-1">
        {timecodes.map((tc) => (
          <button
            key={tc.id}
            onClick={() => seekTo(tc.time_seconds)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
          >
            <span className="min-w-[42px] font-mono text-xs font-medium text-primary">
              {formatTime(tc.time_seconds)}
            </span>
            <span className="text-foreground/80">{tc.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
