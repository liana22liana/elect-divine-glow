import { LogOut, Camera, Send, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useApiData";
import AmbassadorTimeline from "@/components/AmbassadorTimeline";

const SUBSCRIPTION_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Активна", color: "bg-secondary" },
  paused: { label: "Приостановлена", color: "bg-yellow-500" },
  cancelled: { label: "Отменена", color: "bg-destructive" },
};

const ProfilePage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading || !profile) {
    return (
      <div className="space-y-6 pb-24">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const sub = SUBSCRIPTION_LABELS[profile.subscription_status] || SUBSCRIPTION_LABELS.active;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-primary" strokeWidth={1.5} />
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground hover:scale-110 transition-transform">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">
              {profile.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              В клубе с{" "}
              {new Date(profile.created_at).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
          Подписка
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${sub.color}`} />
            <span className="text-sm text-foreground">{sub.label}</span>
          </div>
          {profile.subscription_status === "active" && (
            <p className="text-sm text-muted-foreground">
              Следующее списание:{" "}
              {new Date(
                new Date(profile.subscription_start_date).setMonth(
                  new Date(profile.subscription_start_date).getMonth() + Math.ceil(
                    (new Date().getTime() - new Date(profile.subscription_start_date).getTime()) / (30 * 24 * 60 * 60 * 1000)
                  )
                )
              ).toLocaleDateString("ru-RU")}
            </p>
          )}
          {profile.subscription_end_date && (
            <p className="text-sm text-muted-foreground">
              Действует до: {new Date(profile.subscription_end_date).toLocaleDateString("ru-RU")}
            </p>
          )}
          <Button variant="outline" className="h-10 gap-2 rounded-xl">
            Управление подпиской
          </Button>
        </div>
      </div>

      <div className="h-px bg-border" />

      <AmbassadorTimeline
        currentStatus={profile.ambassador_status}
        subscriptionStartDate={profile.subscription_start_date}
        deliveryFormSubmitted={profile.delivery_form_submitted}
      />

      <div className="h-px bg-border" />

      <Button
        variant="outline"
        className="h-12 w-full gap-2 rounded-xl text-muted-foreground"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4" strokeWidth={1.5} />
        Выйти из аккаунта
      </Button>

      <a
        href="https://t.me/daavilovahelp"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:scale-105 transition-transform"
      >
        <Send className="h-4 w-4" />
        Нужна помощь? Напиши нам
      </a>
    </div>
  );
};

export default ProfilePage;
