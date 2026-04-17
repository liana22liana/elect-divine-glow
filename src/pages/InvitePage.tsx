import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { api, setToken } from "@/lib/api";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "register" | "accepting" | "done" | "error">("loading");
  const [invite, setInvite] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.admin.invites.check(token)
      .then((inv) => { setInvite(inv); setStatus(user ? "valid" : "register"); })
      .catch(() => setStatus("invalid"));
  }, [token, user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const res = await api.auth.register(email, password, name, token!);
      setToken(res.token);
      await refreshUser();
      setStatus("valid");
    } catch (e: any) {
      setErrorMsg(e.message || "Ошибка регистрации");
    } finally {
      setRegistering(false);
    }
  };

  const handleAccept = async () => {
    if (!token) return;
    setStatus("accepting");
    try {
      await api.admin.invites.accept(token);
      setStatus("done");
      setTimeout(() => { window.location.href = "/admin"; }, 2000);
    } catch (e: any) {
      setErrorMsg(e.message || "Ошибка");
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        {status === "loading" && (
          <><Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" /><p className="text-sm text-muted-foreground">Проверяю приглашение...</p></>
        )}

        {status === "invalid" && (
          <><XCircle className="mx-auto h-12 w-12 text-destructive" /><h1 className="font-heading text-2xl font-semibold">Ссылка недействительна</h1><p className="text-sm text-muted-foreground">Приглашение не найдено, уже использовано или истекло.</p><Button variant="outline" onClick={() => navigate("/")}>На главную</Button></>
        )}

        {status === "register" && (
          <>
            <Shield className="mx-auto h-12 w-12 text-primary" />
            <h1 className="font-heading text-2xl font-semibold">Приглашение в команду</h1>
            <p className="text-sm text-muted-foreground">Создайте аккаунт для входа в админ-панель</p>
            <form onSubmit={handleRegister} className="space-y-3 text-left">
              <div className="space-y-1">
                <Label>Имя</Label>
                <Input placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Пароль</Label>
                <Input type="password" placeholder="Минимум 6 символов" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
              <Button type="submit" className="w-full h-11" disabled={registering}>
                {registering ? "Создаём аккаунт..." : "Создать аккаунт"}
              </Button>
            </form>
          </>
        )}

        {status === "valid" && invite && (
          <><Shield className="mx-auto h-12 w-12 text-primary" /><h1 className="font-heading text-2xl font-semibold">Приглашение в команду</h1><p className="text-sm text-muted-foreground">Вас приглашают стать {invite.role === "superadmin" ? "суперадмином" : "администратором"} платформы ELECT.</p><Button className="w-full h-11" onClick={handleAccept}>Принять приглашение</Button></>
        )}

        {status === "accepting" && (
          <><Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" /><p className="text-sm text-muted-foreground">Принимаю приглашение...</p></>
        )}

        {status === "done" && (
          <><CheckCircle className="mx-auto h-12 w-12 text-green-500" /><h1 className="font-heading text-2xl font-semibold">Добро пожаловать!</h1><p className="text-sm text-muted-foreground">Роль назначена. Перенаправляю в админ-панель...</p></>
        )}

        {status === "error" && (
          <><XCircle className="mx-auto h-12 w-12 text-destructive" /><h1 className="font-heading text-2xl font-semibold">Ошибка</h1><p className="text-sm text-muted-foreground">{errorMsg}</p><Button variant="outline" onClick={() => navigate("/")}>На главную</Button></>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
