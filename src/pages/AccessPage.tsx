import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, setToken } from "@/lib/api";
import { Loader2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const AccessPage = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "error" | "expired" | "inactive">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    api.auth.accessLink(token)
      .then((res) => {
        setToken(res.token);
        window.location.href = "/";
      })
      .catch((err: any) => {
        if (err.status === 403) setStatus("inactive");
        else if (err.status === 404) setStatus("expired");
        else setStatus("error");
      });
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Входим в ELECT...</p>
        </div>
      </div>
    );
  }

  const configs = {
    expired: {
      icon: <Clock className="mx-auto h-12 w-12 text-amber-500" />,
      title: "Ссылка использована",
      text: "Эта ссылка уже была использована или истекла. Напиши /access боту, чтобы получить новую.",
      bot: true,
    },
    inactive: {
      icon: <XCircle className="mx-auto h-12 w-12 text-destructive" />,
      title: "Подписка неактивна",
      text: "Твоя подписка закончилась. Оформи подписку — доступ откроется автоматически.",
      bot: false,
    },
    error: {
      icon: <XCircle className="mx-auto h-12 w-12 text-destructive" />,
      title: "Ссылка недействительна",
      text: "Что-то пошло не так. Напиши /access боту @ElectPortal_bot, чтобы получить новую ссылку.",
      bot: true,
    },
  };

  const cfg = configs[status as keyof typeof configs];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        {cfg.icon}
        <h1 className="font-heading text-2xl font-semibold">{cfg.title}</h1>
        <p className="text-sm text-muted-foreground">{cfg.text}</p>
        {cfg.bot && (
          <a href="https://t.me/ElectPortal_bot" target="_blank" rel="noopener noreferrer">
            <Button className="mt-2">Открыть бота</Button>
          </a>
        )}
      </div>
    </div>
  );
};

export default AccessPage;
