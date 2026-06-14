import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return { user, profile: data };
    },
  });

  const save = useMutation({
    mutationFn: async (form: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        id: user!.id,
        email: user!.email,
        full_name: String(form.get("full_name") || ""),
        phone: String(form.get("phone") || ""),
        bio: String(form.get("bio") || ""),
        address: String(form.get("address") || ""),
        city: String(form.get("city") || ""),
        country: String(form.get("country") || ""),
      };
      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["my-profile"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) return <PortalShell title="My profile"><p>Loading…</p></PortalShell>;

  const p = profile?.profile;
  return (
    <PortalShell title="My profile" description="Keep your details current so we can stay in touch.">
      <form
        onSubmit={(e) => { e.preventDefault(); save.mutate(new FormData(e.currentTarget)); }}
        className="max-w-2xl space-y-5 rounded-xl border bg-card p-6"
      >
        <Field label="Full name" name="full_name" defaultValue={p?.full_name ?? ""} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Phone" name="phone" defaultValue={p?.phone ?? ""} />
          <Field label="Email" name="email" defaultValue={profile?.user?.email ?? ""} disabled />
        </div>
        <Field label="Address" name="address" defaultValue={p?.address ?? ""} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="City" name="city" defaultValue={p?.city ?? ""} />
          <Field label="Country" name="country" defaultValue={p?.country ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Short bio</Label>
          <Textarea id="bio" name="bio" rows={4} defaultValue={p?.bio ?? ""} />
        </div>
        <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save changes"}</Button>
      </form>
    </PortalShell>
  );
}

function Field({ label, ...props }: React.ComponentProps<typeof Input> & { label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.name}>{label}</Label>
      <Input id={props.name} {...props} />
    </div>
  );
}
