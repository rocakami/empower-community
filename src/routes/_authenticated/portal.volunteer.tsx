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

export const Route = createFileRoute("/_authenticated/portal/volunteer")({
  component: VolunteerPage,
});

function VolunteerPage() {
  const qc = useQueryClient();
  const { data: app } = useQuery({
    queryKey: ["my-volunteer"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("volunteer_applications").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });

  const save = useMutation({
    mutationFn: async (fd: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const skills = String(fd.get("skills") || "").split(",").map((s) => s.trim()).filter(Boolean);
      const interests = String(fd.get("interests") || "").split(",").map((s) => s.trim()).filter(Boolean);
      const payload = {
        user_id: user!.id,
        skills,
        interests,
        availability: String(fd.get("availability") || ""),
      };
      const { error } = await supabase.from("volunteer_applications").upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Application saved."); qc.invalidateQueries({ queryKey: ["my-volunteer"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <PortalShell title="Volunteer" description="Share your skills and availability with our coordinators.">
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 max-w-4xl">
        <form
          onSubmit={(e) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); }}
          className="rounded-xl border bg-card p-6 space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="skills">Skills <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
            <Input id="skills" name="skills" defaultValue={app?.skills.join(", ") ?? ""} placeholder="GIS, ArcGIS Pro, fiber splicing, teaching" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests">Interests</Label>
            <Input id="interests" name="interests" defaultValue={app?.interests.join(", ") ?? ""} placeholder="Mapping, training, outreach" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Textarea id="availability" name="availability" rows={3} defaultValue={app?.availability ?? ""} placeholder="Weekday evenings, 2 Saturdays/month…" />
          </div>
          <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : app ? "Update application" : "Submit application"}</Button>
        </form>
        <aside className="rounded-xl border bg-card p-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
          <div className="mt-2"><Badge>{app?.status ?? "not submitted"}</Badge></div>
          <div className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">Hours logged</div>
          <div className="mt-1 text-2xl font-semibold">{Number(app?.hours_logged ?? 0)}</div>
        </aside>
      </div>
    </PortalShell>
  );
}
