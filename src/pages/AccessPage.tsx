import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, setToken } from "@/lib/api";
import { Loader2, XCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const AccessPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    if (!token) return;
    api.auth.accessLink(token)
      .then((res) => {
        setToken(res.token);
        // Force full reload to pick up new auth state
        window.location.href = "/";
      })
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="font-heading text-2xl font-semibold">Ссылка недействительна</h1>
          <p className="text-sm text-muted-foreground">
            Эта ссылка доступа не найдена. Обратись в поддержку или запроси новую ссылку у бота.
          </p>
          <Button variant="outline" onClick={() => navigate("/login")}>
            Войти по email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Входим в ELECT...</p>
      </div>
    </div>
  );
};

export default AccessPage;
