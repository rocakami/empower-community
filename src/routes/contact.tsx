import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — EDGE Geospatial" },
      { name: "description", content: "Partner with EDGE Geospatial, volunteer, or ask a question." },
      { property: "og:title", content: "Contact EDGE Geospatial" },
      { property: "og:description", content: "Reach our team about partnerships, volunteering, and programs." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info("Sign in to submit a message — your inquiry will go straight to our team.");
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      subject: String(fd.get("subject") || "Inquiry"),
      message: String(fd.get("message") || ""),
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks! We'll respond by email.");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <PublicLayout>
      <section className="bg-ink text-ink-foreground py-20">
        <div className="mx-auto max-w-5xl px-6">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Contact</span>
          <h1 className="mt-4 text-4xl md:text-5xl">Let's build stronger systems together.</h1>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-6">
          <form onSubmit={onSubmit} className="space-y-5 rounded-xl border bg-card p-8 shadow-card">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" rows={5} required />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Sending…" : "Send message"}
            </Button>
            <p className="text-xs text-muted-foreground">Signed-in users get a tracked ticket in their portal.</p>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
