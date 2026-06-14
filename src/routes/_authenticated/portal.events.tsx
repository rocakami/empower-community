import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/events")({
  component: EventsPage,
});

function EventsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["portal-events"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const [events, regs] = await Promise.all([
        supabase.from("events").select("*").eq("status", "published").order("starts_at", { ascending: true }),
        supabase.from("event_registrations").select("event_id").eq("user_id", user!.id),
      ]);
      return {
        events: events.data ?? [],
        registered: new Set((regs.data ?? []).map((r) => r.event_id)),
      };
    },
  });

  const register = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("event_registrations").insert({ event_id: eventId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Registered. We'll send a reminder."); qc.invalidateQueries({ queryKey: ["portal-events"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  const cancel = useMutation({
    mutationFn: async (eventId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("event_registrations").delete().match({ event_id: eventId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Registration cancelled."); qc.invalidateQueries({ queryKey: ["portal-events"] }); },
  });

  return (
    <PortalShell title="Events" description="Upcoming workshops, webinars, and programs.">
      {data?.events.length === 0 && <p className="text-sm text-muted-foreground">No events scheduled.</p>}
      <div className="space-y-4">
        {data?.events.map((e) => {
          const isReg = data.registered.has(e.id);
          return (
            <div key={e.id} className="rounded-xl border bg-card p-6 flex flex-col sm:flex-row gap-6 items-start">
              <div className="sm:w-32 shrink-0">
                <div className="text-3xl font-semibold text-primary">{format(new Date(e.starts_at), "d")}</div>
                <div className="text-xs uppercase text-muted-foreground tracking-wider">{format(new Date(e.starts_at), "MMM yyyy")}</div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{e.title}</h3>
                {e.description && <p className="text-sm text-muted-foreground mt-1">{e.description}</p>}
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{format(new Date(e.starts_at), "PPp")}</span>
                  {e.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.location}</span>}
                </div>
              </div>
              {isReg ? (
                <div className="flex flex-col gap-2 items-end">
                  <span className="inline-flex items-center gap-1 text-xs text-success font-medium"><Check className="h-3.5 w-3.5" /> Registered</span>
                  <Button size="sm" variant="ghost" onClick={() => cancel.mutate(e.id)}>Cancel</Button>
                </div>
              ) : (
                <Button onClick={() => register.mutate(e.id)} disabled={register.isPending}>Register</Button>
              )}
            </div>
          );
        })}
      </div>
    </PortalShell>
  );
}
