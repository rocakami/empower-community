import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [members, donations, events, vols, tickets] = await Promise.all([
        supabase.from("members").select("status", { count: "exact", head: false }),
        supabase.from("donations").select("amount, status"),
        supabase.from("events").select("id, starts_at, status"),
        supabase.from("volunteer_applications").select("status, hours_logged"),
        supabase.from("support_tickets").select("status"),
      ]);
      const totalRaised = (donations.data ?? []).filter((d) => d.status === "completed").reduce((s, d) => s + Number(d.amount), 0);
      return {
        memberCount: members.data?.length ?? 0,
        activeMembers: (members.data ?? []).filter((m) => m.status === "active").length,
        totalRaised,
        donationCount: donations.data?.length ?? 0,
        upcomingEvents: (events.data ?? []).filter((e) => new Date(e.starts_at) > new Date()).length,
        completedEvents: (events.data ?? []).filter((e) => e.status === "completed").length,
        activeVols: (vols.data ?? []).filter((v) => v.status === "active" || v.status === "approved").length,
        volHours: (vols.data ?? []).reduce((s, v) => s + Number(v.hours_logged), 0),
        openTickets: (tickets.data ?? []).filter((t) => t.status === "open" || t.status === "in_progress").length,
      };
    },
  });

  const stats = [
    ["Total members", data?.memberCount ?? 0],
    ["Active members", data?.activeMembers ?? 0],
    ["Funds raised", `$${(data?.totalRaised ?? 0).toFixed(0)}`],
    ["Donations", data?.donationCount ?? 0],
    ["Upcoming events", data?.upcomingEvents ?? 0],
    ["Events completed", data?.completedEvents ?? 0],
    ["Active volunteers", data?.activeVols ?? 0],
    ["Volunteer hours", data?.volHours ?? 0],
    ["Open tickets", data?.openTickets ?? 0],
  ] as const;

  return (
    <AdminShell title="Overview" description="Organization performance at a glance.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
              <div className="text-3xl font-semibold mt-1">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
