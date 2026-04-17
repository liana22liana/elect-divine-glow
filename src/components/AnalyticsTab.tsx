import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Users, Eye, TrendingUp, Calendar } from "lucide-react";

export function AnalyticsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: api.admin.analytics,
  });

  if (isLoading) return <div className="p-6 text-center text-muted-foreground">Загрузка...</div>;
  if (!data) return null;

  const maxViews = data.topMaterials.length > 0 ? Math.max(...data.topMaterials.map((m: any) => Number(m.views))) : 1;

  return (
    <div className="space-y-6 p-1">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5 text-primary" />} label="Всего участниц" value={data.totalUsers} />
        <StatCard icon={<TrendingUp className="h-5 w-5 text-green-500" />} label="Активные подписки" value={data.activeUsers} />
        <StatCard icon={<Calendar className="h-5 w-5 text-blue-500" />} label="Заходили сегодня" value={data.onlineToday} />
        <StatCard icon={<Eye className="h-5 w-5 text-purple-500" />} label="Просмотров всего" value={data.totalViews} />
      </div>

      {/* Online activity */}
      <div className="rounded-2xl border bg-card p-4">
        <h3 className="mb-3 font-semibold text-foreground">Активность</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">За 7 дней</span><span className="font-medium">{data.onlineWeek} участниц</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">За 30 дней</span><span className="font-medium">{data.onlineMonth} участниц</span></div>
        </div>
      </div>

      {/* Top materials */}
      <div className="rounded-2xl border bg-card p-4">
        <h3 className="mb-3 font-semibold text-foreground">Топ материалов</h3>
        {data.topMaterials.length === 0 ? (
          <p className="text-sm text-muted-foreground">Просмотров пока нет</p>
        ) : (
          <div className="space-y-3">
            {data.topMaterials.map((m: any) => (
              <div key={m.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="truncate pr-2 text-foreground">{m.title}</span>
                  <span className="shrink-0 font-medium text-muted-foreground">{m.views} просм.</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.round((Number(m.views) / maxViews) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* By section */}
      <div className="rounded-2xl border bg-card p-4">
        <h3 className="mb-3 font-semibold text-foreground">По разделам</h3>
        <div className="space-y-2 text-sm">
          {data.bySection.map((s: any) => (
            <div key={s.section} className="flex justify-between">
              <span className="text-muted-foreground">{s.section}</span>
              <span className="font-medium">{s.views} просм.</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4">
      {icon}
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
