import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/announcements")({
  component: AnnouncementsAdmin,
});

function AnnouncementsAdmin() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async (fd: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("announcements").insert({
        title: String(fd.get("title") || ""),
        body: String(fd.get("body") || ""),
        audience: String(fd.get("audience") || "all"),
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Announcement posted"); qc.invalidateQueries({ queryKey: ["admin-announcements"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <AdminShell title="Announcements" description="Post community updates visible in every member's dashboard.">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <form
          onSubmit={(e) => { e.preventDefault(); create.mutate(new FormData(e.currentTarget)); (e.target as HTMLFormElement).reset(); }}
          className="rounded-xl border bg-card p-6 space-y-4 self-start"
        >
          <h3 className="text-lg font-semibold">New announcement</h3>
          <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
          <div className="space-y-2"><Label htmlFor="audience">Audience</Label><Input id="audience" name="audience" defaultValue="all" /></div>
          <div className="space-y-2"><Label htmlFor="body">Body</Label><Textarea id="body" name="body" rows={6} required /></div>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Posting…" : "Publish"}</Button>
        </form>
        <div className="space-y-3">
          {rows.map((a) => (
            <div key={a.id} className="rounded-lg border bg-card p-4">
              <div className="flex justify-between items-baseline">
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(a.created_at), "PP")}</div>
              </div>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{a.body}</p>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
        </div>
      </div>
    </AdminShell>
  );
}
