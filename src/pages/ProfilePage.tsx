import { LogOut, Calendar, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockUser } from "@/lib/mock-data";

const ProfilePage = () => {
  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold text-foreground">
        Профиль
      </h1>

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <User className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {mockUser.name}
            </h2>
            <p className="text-sm text-muted-foreground">{mockUser.email}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-foreground">{mockUser.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-foreground">
              Подписка с{" "}
              {new Date(mockUser.created_at).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                mockUser.subscription_active ? "bg-green-500" : "bg-destructive"
              }`}
            />
            <span className="text-foreground">
              {mockUser.subscription_active ? "Подписка активна" : "Подписка неактивна"}
            </span>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        className="h-12 w-full gap-2 rounded-lg text-muted-foreground"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.5} />
        Выйти из аккаунта
      </Button>
    </div>
  );
};

export default ProfilePage;
