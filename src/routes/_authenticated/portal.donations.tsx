import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/portal/donations")({
  component: DonationsPage,
});

function DonationsPage() {
  const { data: donations = [] } = useQuery({
    queryKey: ["my-donations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("donations").select("*").eq("user_id", user!.id).order("donated_at", { ascending: false });
      return data ?? [];
    },
  });

  const total = donations.reduce((s, d) => s + Number(d.amount), 0);

  return (
    <PortalShell title="My donations" description="History of your contributions to EDGE Geospatial.">
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-6 border-b flex items-baseline justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Lifetime giving</div>
            <div className="text-3xl font-semibold mt-1">${total.toFixed(2)}</div>
          </div>
          <div className="text-sm text-muted-foreground">{donations.length} contributions</div>
        </div>
        {donations.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No donations recorded yet. When you give, your history will appear here.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{format(new Date(d.donated_at), "PP")}</TableCell>
                  <TableCell className="font-medium">{d.currency} {Number(d.amount).toFixed(2)}</TableCell>
                  <TableCell><Badge variant="outline">{d.kind === "monthly" ? "Monthly" : "One-time"}</Badge></TableCell>
                  <TableCell>{d.campaign ?? "—"}</TableCell>
                  <TableCell><Badge variant={d.status === "completed" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </PortalShell>
  );
}
