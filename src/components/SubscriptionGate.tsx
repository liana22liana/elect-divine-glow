import { useAuth } from "@/contexts/AuthContext";
import { Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const SubscriptionGate = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  // Admins and superadmins always have access
  if (user?.role === "admin" || user?.role === "superadmin") {
    return <>{children}</>;
  }

  // Active subscription — show content
  if (user?.subscription_status === "active") {
    return <>{children}</>;
  }

  // Inactive subscription — show gate
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <Lock className="h-10 w-10 text-primary" strokeWidth={1.5} />
      </div>
      <div className="space-y-2 max-w-sm">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Подписка неактивна
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Для доступа к материалам клуба нужна активная подписка. 
          Оплати подписку через бота, и доступ откроется автоматически.
        </p>
      </div>
      <a
        href="https://t.me/daavilovahelp"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button className="h-11 gap-2 rounded-xl">
          <Send className="h-4 w-4" />
          Написать в поддержку
        </Button>
      </a>
    </div>
  );
};

export default SubscriptionGate;
