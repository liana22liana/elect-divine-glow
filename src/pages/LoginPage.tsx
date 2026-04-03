import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      toast({ title: "Ошибка входа", description: err.message || "Неверный email или пароль", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-card to-muted px-4">
      <div className="w-full max-w-sm space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-wide text-foreground">
            ELECT
          </h1>
          <p className="mt-1 text-sm tracking-widest text-muted-foreground">
            by Dasha Avilova
          </p>
          <div className="mx-auto mt-3 h-px w-12 bg-primary/60 rounded-full" />
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-12 rounded-xl border-border bg-card/60 backdrop-blur-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm text-foreground">
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 rounded-xl border-border bg-card/60 backdrop-blur-sm"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl text-base font-medium"
          >
            {loading ? "Вход..." : "Войти"}
          </Button>
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Забыли пароль?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
