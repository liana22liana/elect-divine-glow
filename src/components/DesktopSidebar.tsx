import { Home, BookOpen, User, LogOut, Shield } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Главная" },
  { to: "/library", icon: BookOpen, label: "Библиотека" },
  { to: "/profile", icon: User, label: "Профиль" },
  { to: "/admin", icon: Shield, label: "Админ" },
];

const DesktopSidebar = () => {
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-border bg-card/80 backdrop-blur-md lg:flex">
      <div className="flex flex-col items-center gap-1 px-6 py-8">
        <h1 className="font-heading text-2xl font-semibold tracking-wide text-foreground">
          ELECT
        </h1>
        <p className="text-xs text-muted-foreground tracking-widest">
          by Dasha Avilova
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-body transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
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
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <LogOut className="h-5 w-5" strokeWidth={1.5} />
          Выйти
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
