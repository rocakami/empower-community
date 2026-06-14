import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { MapPin, Cable, GraduationCap, Handshake, ShieldCheck, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — EDGE Geospatial" },
      { name: "description", content: "Geospatial solutions, utility modernization, workforce training, and trusted partnerships." },
      { property: "og:title", content: "Services — EDGE Geospatial" },
      { property: "og:description", content: "What EDGE Geospatial delivers for utilities and communities." },
    ],
  }),
  component: Services,
});

const services = [
  { icon: MapPin, title: "Geospatial Solutions", body: "Field collection, network mapping, asset inventories, and spatial analytics for utility planning." },
  { icon: Cable, title: "Utility Modernization", body: "Migrating legacy records, integrating SCADA/AMI data, and connecting field and office systems." },
  { icon: GraduationCap, title: "Workforce Training", body: "GIS, fiber, and field-ops curriculum — for both job seekers and existing utility staff." },
  { icon: Handshake, title: "Trusted Partnerships", body: "Convening utilities, community colleges, and economic-development partners." },
  { icon: ShieldCheck, title: "Operational Security", body: "Data-handling practices and compliance posture for critical infrastructure information." },
  { icon: BarChart3, title: "Data-Driven Insights", body: "Dashboards and reporting that turn spatial data into operational decisions." },
];

function Services() {
  return (
    <PublicLayout>
      <section className="bg-ink text-ink-foreground py-20">
        <div className="mx-auto max-w-5xl px-6">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Services</span>
          <h1 className="mt-4 text-4xl md:text-5xl">What we deliver for utilities and communities.</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title} className="rounded-xl border bg-card p-6 shadow-card">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center mb-4">
                <s.icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg">{s.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
