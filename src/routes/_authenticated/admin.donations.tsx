import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/donations")({
  component: DonationsAdmin,
});

function DonationsAdmin() {
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: async () => {
      const { data } = await supabase.from("donations")
        .select("*, profiles:profiles!donations_profile_fk(full_name, email)")
        .order("donated_at", { ascending: false });
      return data ?? [];
    },
  });

  const total = rows.filter((r) => r.status === "completed").reduce((s, r) => s + Number(r.amount), 0);

  return (
    <AdminShell title="Donations" description="All recorded contributions, exportable for the accountant.">
      <div className="rounded-xl border bg-card mb-4 p-6 flex items-baseline justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total raised (completed)</div>
          <div className="text-3xl font-semibold mt-1">${total.toFixed(2)}</div>
        </div>
        <div className="text-sm text-muted-foreground">{rows.length} records</div>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => {
              const p = (d as { profiles?: { full_name?: string; email?: string } }).profiles;
              return (
                <TableRow key={d.id}>
                  <TableCell>{p?.full_name ?? p?.email ?? "Anonymous"}</TableCell>
                  <TableCell className="font-medium">{d.currency} {Number(d.amount).toFixed(2)}</TableCell>
                  <TableCell><Badge variant="outline">{d.kind}</Badge></TableCell>
                  <TableCell>{d.campaign ?? "—"}</TableCell>
                  <TableCell><Badge>{d.status}</Badge></TableCell>
                  <TableCell className="text-xs">{format(new Date(d.donated_at), "PP")}</TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No donations recorded.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
