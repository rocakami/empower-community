import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, User, Heart, Calendar, HandHeart, FileText, LifeBuoy, Bell, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

const items: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }> = [
  { to: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/portal/profile", label: "My profile", icon: User },
  { to: "/portal/donations", label: "Donations", icon: Heart },
  { to: "/portal/events", label: "Events", icon: Calendar },
  { to: "/portal/volunteer", label: "Volunteer", icon: HandHeart },
  { to: "/portal/documents", label: "Documents", icon: FileText },
  { to: "/portal/support", label: "Support", icon: LifeBuoy },
  { to: "/portal/notifications", label: "Notifications", icon: Bell },
];

export function PortalShell({ children, title, description }: { children: ReactNode; title: string; description?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: isStaff } = useQuery({
    queryKey: ["is-staff"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data } = await supabase.from("user_roles")
        .select("role").eq("user_id", user.id);
      const staff = new Set(["super_admin", "program_manager", "finance_admin", "volunteer_coordinator", "communications_admin"]);
      return (data ?? []).some((r) => staff.has(r.role));
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr] bg-muted/30">
      <aside className="hidden md:flex flex-col bg-sidebar border-r">
        <div className="p-6">
          <Link to="/" className="brand-mark text-sidebar-foreground">EDGE</Link>
          <p className="text-xs text-muted-foreground mt-2">Member portal</p>
        </div>
        <nav className="px-3 space-y-1 flex-1">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent")
                }
              >
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
          {isStaff && (
            <Link
              to="/admin"
              className={
                "mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors border-t pt-4 " +
                (pathname.startsWith("/admin")
                  ? "text-primary font-medium"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent")
              }
            >
              <Shield className="h-4 w-4" /> Admin dashboard
            </Link>
          )}
        </nav>
        <div className="p-3">
          <Button onClick={signOut} variant="ghost" size="sm" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="border-b bg-background px-6 md:px-10 py-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </header>
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
