import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/portal/support")({
  component: SupportPage,
});

function SupportPage() {
  const qc = useQueryClient();
  const { data: tickets = [] } = useQuery({
    queryKey: ["my-tickets"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("support_tickets").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (fd: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user!.id,
        subject: String(fd.get("subject") || ""),
        message: String(fd.get("message") || ""),
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Ticket submitted."); qc.invalidateQueries({ queryKey: ["my-tickets"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <PortalShell title="Support" description="Submit an inquiry or follow up on an existing ticket.">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <form
          onSubmit={(e) => { e.preventDefault(); create.mutate(new FormData(e.currentTarget)); (e.target as HTMLFormElement).reset(); }}
          className="rounded-xl border bg-card p-6 space-y-4 self-start"
        >
          <h3 className="text-lg font-semibold">New ticket</h3>
          <div className="space-y-2"><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" required /></div>
          <div className="space-y-2"><Label htmlFor="message">Message</Label><Textarea id="message" name="message" rows={5} required /></div>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Sending…" : "Submit"}</Button>
        </form>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Your tickets</h3>
          {tickets.length === 0 && <p className="text-sm text-muted-foreground">No tickets yet.</p>}
          {tickets.map((t) => (
            <div key={t.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{t.subject}</div>
                <Badge variant={t.status === "open" ? "secondary" : "default"}>{t.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{t.message}</p>
              {t.admin_response && (
                <div className="mt-3 border-l-2 border-primary/40 pl-3 text-sm">
                  <div className="text-xs uppercase text-muted-foreground">Reply from team</div>
                  <p className="mt-1 whitespace-pre-wrap">{t.admin_response}</p>
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2">{format(new Date(t.created_at), "PPp")}</div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
