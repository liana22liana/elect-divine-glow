import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "done" | "error">("form");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Минимум 6 символов"); return; }
    if (password !== confirm) { toast.error("Пароли не совпадают"); return; }
    if (!token) return;

    setStatus("loading");
    try {
      await api.auth.resetPassword(token, password);
      setStatus("done");
      setTimeout(() => navigate("/login"), 3000);
    } catch (e: any) {
      toast.error(e.message || "Ошибка");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h1 className="font-heading text-2xl font-semibold">Пароль изменён</h1>
          <p className="text-sm text-muted-foreground">Перенаправляю на вход...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="font-heading text-2xl font-semibold">Ссылка недействительна</h1>
          <p className="text-sm text-muted-foreground">Ссылка истекла или уже использована. Запросите новую.</p>
          <Button variant="outline" onClick={() => navigate("/login")}>На страницу входа</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <KeyRound className="mx-auto h-12 w-12 text-primary" />
          <h1 className="font-heading text-2xl font-semibold">Новый пароль</h1>
          <p className="text-sm text-muted-foreground">Придумайте новый пароль для входа</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Новый пароль</Label>
            <Input type="password" placeholder="Минимум 6 символов" className="h-11" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Повторите пароль</Label>
            <Input type="password" placeholder="Ещё раз" className="h-11" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={status === "loading"}>
            {status === "loading" ? "Сохраняю..." : "Сохранить пароль"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
