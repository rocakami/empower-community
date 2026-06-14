import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: EventsAdmin,
});

function EventsAdmin() {
  const qc = useQueryClient();
  const { data: events = [] } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (fd: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("events").insert({
        title: String(fd.get("title") || ""),
        description: String(fd.get("description") || ""),
        location: String(fd.get("location") || ""),
        starts_at: new Date(String(fd.get("starts_at"))).toISOString(),
        capacity: Number(fd.get("capacity") || 0) || null,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Event created"); qc.invalidateQueries({ queryKey: ["admin-events"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <AdminShell title="Events" description="Create and manage workshops, webinars, and programs.">
      <div className="flex justify-end mb-4">
        <Dialog>
          <DialogTrigger asChild><Button>New event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create event</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); create.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
              <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" rows={3} /></div>
              <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" name="location" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label htmlFor="starts_at">Start (ISO)</Label><Input id="starts_at" name="starts_at" type="datetime-local" required /></div>
                <div className="space-y-2"><Label htmlFor="capacity">Capacity</Label><Input id="capacity" name="capacity" type="number" /></div>
              </div>
              <Button type="submit" disabled={create.isPending}>{create.isPending ? "Saving…" : "Create"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-xl border bg-card divide-y">
        {events.map((e) => (
          <div key={e.id} className="p-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-medium">{e.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {format(new Date(e.starts_at), "PPp")} · {e.location ?? "—"} · {e.status}
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No events yet.</div>}
      </div>
    </AdminShell>
  );
}
