import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, Calendar, Heart, HandHeart, Megaphone, ShieldCheck, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

const items: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }> = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/members", label: "Members & CRM", icon: Users },
  { to: "/admin/events", label: "Events", icon: Calendar },
  { to: "/admin/donations", label: "Donations", icon: Heart },
  { to: "/admin/volunteers", label: "Volunteers", icon: HandHeart },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { to: "/admin/staff", label: "Staff & roles", icon: ShieldCheck },
];

export function AdminShell({ children, title, description }: { children: ReactNode; title: string; description?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: isStaff, isLoading } = useQuery({
    queryKey: ["is-staff-gate"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
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

  if (isLoading) return <div className="p-10 text-sm text-muted-foreground">Checking permissions…</div>;
  if (!isStaff) return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Staff access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your account doesn't have permission to view the admin dashboard. Ask a super admin to grant a staff role.</p>
        <Button asChild className="mt-6" variant="outline"><Link to="/portal">Back to portal</Link></Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr] bg-muted/30">
      <aside className="hidden md:flex flex-col bg-ink text-ink-foreground border-r">
        <div className="p-6">
          <Link to="/" className="brand-mark text-ink-foreground">EDGE</Link>
          <p className="text-xs text-ink-foreground/60 mt-2">Admin</p>
        </div>
        <nav className="px-3 space-y-1 flex-1">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to as never}
                className={
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
                  (active ? "bg-primary text-primary-foreground" : "text-ink-foreground/80 hover:bg-white/5")
                }
              >
                <it.icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
          <Link to="/portal" className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ink-foreground/70 hover:bg-white/5 border-t pt-4">
            <ArrowLeft className="h-4 w-4" /> Member portal
          </Link>
        </nav>
        <div className="p-3">
          <Button onClick={signOut} variant="ghost" size="sm" className="w-full justify-start gap-2 text-ink-foreground hover:bg-white/10 hover:text-ink-foreground">
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
