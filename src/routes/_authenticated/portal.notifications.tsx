import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/portal/notifications")({
  component: NotifPage,
});

function NotifPage() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["my-notifs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-notifs"] }),
  });

  return (
    <PortalShell title="Notifications" description="Reminders, updates, and confirmations.">
      {items.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">No notifications.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id} className={`rounded-lg border p-4 flex items-start justify-between gap-4 ${n.read_at ? "bg-card" : "bg-primary/5 border-primary/20"}`}>
              <div>
                <div className="font-medium">{n.title}</div>
                {n.body && <p className="text-sm text-muted-foreground mt-1">{n.body}</p>}
                <div className="text-xs text-muted-foreground mt-1">{format(new Date(n.created_at), "PPp")}</div>
              </div>
              {!n.read_at && <Button size="sm" variant="ghost" onClick={() => markRead.mutate(n.id)}>Mark read</Button>}
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  );
}
