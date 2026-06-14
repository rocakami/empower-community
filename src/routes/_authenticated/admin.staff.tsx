import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: StaffAdmin,
});

const STAFF_ROLES = [
  "super_admin",
  "program_manager",
  "finance_admin",
  "volunteer_coordinator",
  "communications_admin",
] as const;

function StaffAdmin() {
  const { data = [] } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles")
        .select("user_id, role, profiles:profiles!user_roles_user_id_fkey(full_name, email)")
        .in("role", STAFF_ROLES as unknown as string[]);
      return data ?? [];
    },
  });

  return (
    <AdminShell title="Staff & roles" description="Permissions are enforced server-side via roles.">
      <div className="rounded-xl border bg-card p-6 mb-4 text-sm text-muted-foreground">
        Role assignments are managed by super admins. To grant a staff role, ask a super admin to
        insert a record into <code className="text-foreground">user_roles</code> from the Cloud dashboard.
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {data.map((r, i) => {
              const p = (r as { profiles?: { full_name?: string; email?: string } }).profiles;
              return (
                <TableRow key={`${r.user_id}-${r.role}-${i}`}>
                  <TableCell>{p?.full_name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p?.email ?? "—"}</TableCell>
                  <TableCell><Badge>{r.role}</Badge></TableCell>
                </TableRow>
              );
            })}
            {data.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-10 text-sm text-muted-foreground">No staff roles assigned yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}
