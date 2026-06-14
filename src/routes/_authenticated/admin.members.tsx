import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/members")({
  component: MembersAdmin,
});

function MembersAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-members"],
    queryFn: async () => {
      const { data } = await supabase.from("members")
        .select("id, user_id, member_type, status, tags, joined_at, profiles:profiles!members_user_id_fkey(full_name, email, phone)")
        // members.user_id references auth.users, so join via the profiles table id column
        .order("joined_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("members").update({ status: status as never }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["admin-members"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const p = (r as { profiles?: { full_name?: string; email?: string } }).profiles;
    const hay = `${p?.full_name ?? ""} ${p?.email ?? ""} ${r.member_type}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <AdminShell title="Members & CRM" description="Central database of every member, donor, volunteer, partner, and beneficiary.">
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <Input placeholder="Search by name, email, or type…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => {
              const p = (r as { profiles?: { full_name?: string; email?: string } }).profiles;
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{p?.full_name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p?.email ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline">{r.member_type}</Badge></TableCell>
                  <TableCell className="space-x-1">
                    {(r.tags ?? []).slice(0, 3).map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </TableCell>
                  <TableCell className="text-xs">{new Date(r.joined_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select value={r.status} onValueChange={(v) => updateStatus.mutate({ id: r.id, status: v })}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">No members match.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
