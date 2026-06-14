import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — EDGE Geospatial" },
      { name: "description", content: "Workshops, webinars, and community programs from EDGE Geospatial." },
      { property: "og:title", content: "Events — EDGE Geospatial" },
      { property: "og:description", content: "Upcoming workshops, webinars, and fundraising events." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, location, starts_at, status")
        .eq("status", "published")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <PublicLayout>
      <section className="bg-ink text-ink-foreground py-20">
        <div className="mx-auto max-w-5xl px-6">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Events</span>
          <h1 className="mt-4 text-4xl md:text-5xl">Upcoming programs and workshops.</h1>
          <p className="mt-4 text-ink-foreground/70 max-w-2xl">
            Sign in to register, get reminders, and receive your digital attendance certificate.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          {isLoading && <p className="text-muted-foreground">Loading events…</p>}
          {!isLoading && events.length === 0 && (
            <div className="rounded-xl border bg-card p-12 text-center">
              <p className="text-muted-foreground">No upcoming events scheduled yet. Check back soon.</p>
              <Link to="/auth" className="text-primary hover:underline mt-3 inline-block">Sign in to get notified</Link>
            </div>
          )}
          <ul className="space-y-4">
            {events.map((e) => (
              <li key={e.id} className="rounded-xl border bg-card p-6 shadow-card flex flex-col sm:flex-row gap-6">
                <div className="sm:w-40 shrink-0">
                  <div className="text-3xl font-semibold text-primary">{format(new Date(e.starts_at), "d")}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{format(new Date(e.starts_at), "MMM yyyy")}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl">{e.title}</h3>
                  {e.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.description}</p>}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {format(new Date(e.starts_at), "PPp")}</span>
                    {e.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>}
                  </div>
                </div>
                <Link to="/auth" className="self-start sm:self-center text-sm text-primary hover:underline">
                  Sign in to register →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PublicLayout>
  );
}
