import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "accepting" | "done" | "error">("loading");
  const [invite, setInvite] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    api.admin.invites.check(token)
      .then((inv) => { setInvite(inv); setStatus("valid"); })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setStatus("accepting");
    try {
      await api.admin.invites.accept(token);
      setStatus("done");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 2000);
    } catch (e: any) {
      setErrorMsg(e.message || "Ошибка");
      setStatus("error");
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <Shield className="mx-auto h-12 w-12 text-primary" />
          <h1 className="font-heading text-2xl font-semibold">Приглашение в команду</h1>
          <p className="text-sm text-muted-foreground">
            Для принятия приглашения нужно войти в аккаунт или зарегистрироваться.
          </p>
          <Button className="w-full h-11" onClick={() => navigate(`/login?redirect=/invite/${token}`)}>
            Войти / Зарегистрироваться
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Проверяю приглашение...</p>
          </>
        )}

        {status === "invalid" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="font-heading text-2xl font-semibold">Ссылка недействительна</h1>
            <p className="text-sm text-muted-foreground">
              Приглашение не найдено, уже использовано или истекло.
            </p>
            <Button variant="outline" onClick={() => navigate("/")}>На главную</Button>
          </>
        )}

        {status === "valid" && invite && (
          <>
            <Shield className="mx-auto h-12 w-12 text-primary" />
            <h1 className="font-heading text-2xl font-semibold">Приглашение в команду</h1>
            <p className="text-sm text-muted-foreground">
              Вас приглашают стать {invite.role === "superadmin" ? "суперадмином" : "администратором"} платформы ELECT.
            </p>
            <Button className="w-full h-11" onClick={handleAccept}>
              Принять приглашение
            </Button>
          </>
        )}

        {status === "accepting" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Принимаю приглашение...</p>
          </>
        )}

        {status === "done" && (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="font-heading text-2xl font-semibold">Добро пожаловать!</h1>
            <p className="text-sm text-muted-foreground">
              Роль назначена. Перенаправляю в админ-панель...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="font-heading text-2xl font-semibold">Ошибка</h1>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <Button variant="outline" onClick={() => navigate("/")}>На главную</Button>
          </>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
