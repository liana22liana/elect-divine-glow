import { Home, BookOpen, Target, User, LogOut, Shield } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const baseNavItems = [
  { to: "/", icon: Home, label: "Главная" },
  { to: "/library", icon: BookOpen, label: "Библиотека" },
  { to: "/goals", icon: Target, label: "Привычки" },
  { to: "/profile", icon: User, label: "Профиль" },
];

const DesktopSidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-border bg-sidebar backdrop-blur-md lg:flex">
      <div className="flex flex-col items-center gap-1 px-6 py-8">
        <h1 className="font-heading text-2xl font-semibold tracking-wide text-foreground">
          ELECT
        </h1>
        <p className="text-xs text-muted-foreground tracking-widest">
          by Daria Avilova
        </p>
        <div className="mt-2 h-px w-12 bg-primary/60 rounded-full" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {[...baseNavItems, ...(user?.role === "admin" || user?.role === "superadmin" ? [{ to: "/admin", icon: Shield, label: "Админ" }] : [])].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-body transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-4 w-4 text-primary" strokeWidth={1.5} />
            )}
          </div>
          <span className="text-sm font-body text-foreground truncate">{user?.name || "Пользователь"}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          Выйти
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
