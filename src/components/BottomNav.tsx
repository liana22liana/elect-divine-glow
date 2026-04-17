import { Home, BookOpen, Target, User, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/", icon: Home, label: "Главная" },
  { to: "/library", icon: BookOpen, label: "Библиотека" },
  { to: "/goals", icon: Target, label: "Привычки" },
  { to: "/profile", icon: User, label: "Профиль" },
];

const BottomNav = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const items = isAdmin
    ? [...navItems, { to: "/admin", icon: Settings, label: "Админ" }]
    : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/80 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span className="font-body">{label}</span>
                {isActive && (
                  <div className="h-1 w-1 rounded-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
