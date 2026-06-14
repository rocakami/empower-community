import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/volunteers")({
  component: VolunteersAdmin,
});

function VolunteersAdmin() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-volunteers"],
    queryFn: async () => {
      const { data } = await supabase.from("volunteer_applications")
        .select("*, profiles:profiles!volunteer_applications_user_id_fkey(full_name, email)")
        .order("applied_at", { ascending: false });
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("volunteer_applications").update({ status: status as never }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-volunteers"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <AdminShell title="Volunteers" description="Applications, approvals, and hours.">
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const p = (r as { profiles?: { full_name?: string; email?: string } }).profiles;
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{p?.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{p?.email}</div>
                  </TableCell>
                  <TableCell className="space-x-1">
                    {r.skills.slice(0, 3).map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{r.availability ?? "—"}</TableCell>
                  <TableCell>{Number(r.hours_logged)}</TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => update.mutate({ id: r.id, status: v })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applicant">Applicant</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-10 text-sm text-muted-foreground">No applications yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
