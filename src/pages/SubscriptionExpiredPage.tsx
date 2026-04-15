import { Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const SubscriptionExpiredPage = () => {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
          <Lock className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-semibold">Подписка закончилась</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Твой доступ к платформе ELECT приостановлен.<br />
            Оформи подписку — и доступ откроется автоматически.
          </p>
        </div>
        <div className="space-y-3">
          <a href="https://t.me/daavilovahelp" target="_blank" rel="noopener noreferrer">
            <Button className="w-full h-11 gap-2 rounded-xl">
              <Send className="h-4 w-4" />
              Написать в поддержку
            </Button>
          </a>
          <Button variant="ghost" className="w-full" onClick={logout}>
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpiredPage;
