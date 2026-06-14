import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, GraduationCap, ShieldCheck, BarChart3, Handshake, Cable } from "lucide-react";
import heroImg from "@/assets/hero-utilities.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EDGE Geospatial — Stronger Utility Operations. Stronger Workforce." },
      { name: "description", content: "501(c)(3) nonprofit modernizing utility systems through geospatial solutions and workforce training." },
      { property: "og:title", content: "EDGE Geospatial" },
      { property: "og:description", content: "Stronger utility operations. Stronger workforce." },
    ],
  }),
  component: Home,
});

const solutions = [
  { icon: MapPin, title: "Geospatial Solutions", body: "Advanced mapping and spatial data analysis to optimize utility networks and infrastructure planning." },
  { icon: Cable, title: "Utility Modernization", body: "Upgrading legacy systems with modern, connected technologies for improved efficiency and reliability." },
  { icon: GraduationCap, title: "Workforce Training", body: "Industry-aligned educational programs designed to upskill your team for modern utility operations." },
  { icon: Handshake, title: "Trusted Partnerships", body: "Collaborating across government, education, and industry to build sustainable local capacity." },
  { icon: ShieldCheck, title: "Operational Security", body: "Robust security protocols and compliance for critical infrastructure data systems." },
  { icon: BarChart3, title: "Data-Driven Insights", body: "Leveraging analytics to turn complex spatial data into actionable operational intelligence." },
];

function Home() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroImg}
          alt="Utility workers inspecting fiber infrastructure"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
        <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-36">
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary mb-6">Modernizing Utility Systems</span>
          <h1 className="text-4xl md:text-6xl font-semibold max-w-3xl leading-[1.05]">
            Stronger Utility Operations.<br />
            <span className="text-primary">Stronger Workforce.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-ink-foreground/80">
            EDGE Geospatial helps utilities modernize systems and build the workforce required to
            sustain them. Through proven geospatial solutions and industry-aligned training, we
            deliver trusted partnerships across government, education, and industry.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/services">Explore Solutions <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/contact">Partner With Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl">Comprehensive Solutions for Modern Utilities</h2>
            <p className="mt-4 text-muted-foreground">
              We provide the tools, technology, and training necessary to sustain and grow your
              utility infrastructure in a rapidly evolving landscape.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {solutions.map((s) => (
              <div key={s.title} className="rounded-xl border bg-card p-6 shadow-card hover:shadow-elevated transition-shadow">
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center mb-4">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="py-24 bg-muted/40 border-y">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-primary">Why Partner With EDGE</span>
            <h2 className="mt-4 text-3xl md:text-4xl">Trusted partnerships across government, education, and industry.</h2>
            <p className="mt-4 text-muted-foreground">
              We deliver outcomes that modernize systems and build a sustainable workforce.
            </p>
            <Button asChild className="mt-8" size="lg">
              <Link to="/auth" search={{ mode: "signup" } as never}>Join as a member</Link>
            </Button>
          </div>
          <div className="space-y-6">
            {[
              ["Strengthen Operations", "We strengthen operations through accurate mapping, data integration, and GIS consulting."],
              ["Expand Workforce Capacity", "We expand workforce capacity by training job seekers and upskilling existing staff."],
              ["Build Industry Pipelines", "We connect communities, colleges, and employers to grow long-term talent pipelines."],
            ].map(([t, b]) => (
              <div key={t} className="rounded-lg bg-card p-6 border">
                <h3 className="text-lg">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl">Help us power the next generation of utility operations.</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Members, volunteers, donors, and partners — every role moves the mission forward.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" } as never}>Become a member</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/contact">Get in touch</Link></Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
