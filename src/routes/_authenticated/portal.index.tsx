import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, HandHeart, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/portal/")({
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const [profile, member, donations, regs, vol, announcements] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
        supabase.from("members").select("status, member_type, tags").eq("user_id", user.id).maybeSingle(),
        supabase.from("donations").select("amount, currency, donated_at").eq("user_id", user.id).order("donated_at", { ascending: false }).limit(5),
        supabase.from("event_registrations").select("id, attended, events(title, starts_at)").eq("user_id", user.id),
        supabase.from("volunteer_applications").select("status, hours_logged").eq("user_id", user.id).maybeSingle(),
        supabase.from("announcements").select("id, title, body, created_at").order("created_at", { ascending: false }).limit(3),
      ]);
      return {
        user,
        profile: profile.data,
        member: member.data,
        donations: donations.data ?? [],
        regs: regs.data ?? [],
        vol: vol.data,
        announcements: announcements.data ?? [],
      };
    },
  });

  const totalGiven = (data?.donations ?? []).reduce((s, d) => s + Number(d.amount), 0);

  return (
    <PortalShell title={`Welcome${data?.profile?.full_name ? `, ${data.profile.full_name.split(" ")[0]}` : ""}`} description="Your membership at a glance.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Heart} label="Lifetime giving" value={`$${totalGiven.toFixed(0)}`} />
        <Stat icon={Calendar} label="Event registrations" value={String(data?.regs.length ?? 0)} />
        <Stat icon={HandHeart} label="Volunteer hours" value={String(Number(data?.vol?.hours_logged ?? 0))} />
        <Stat icon={Bell} label="Status" value={data?.member?.status ?? "pending"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Community updates</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {data?.announcements.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
            {data?.announcements.map((a) => (
              <div key={a.id} className="border-l-2 border-primary/30 pl-4">
                <div className="text-sm font-medium">{a.title}</div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.body}</p>
                <div className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Your tags</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(data?.member?.tags ?? []).length === 0 && <p className="text-sm text-muted-foreground">No tags yet.</p>}
            {(data?.member?.tags ?? []).map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="text-2xl font-semibold mt-1 capitalize">{value}</div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
