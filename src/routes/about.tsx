import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — EDGE Geospatial" },
      { name: "description", content: "Our mission: modernize utility systems and build the workforce required to sustain them." },
      { property: "og:title", content: "About EDGE Geospatial" },
      { property: "og:description", content: "A 501(c)(3) nonprofit bridging utilities, education, and government." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicLayout>
      <section className="bg-ink text-ink-foreground py-20">
        <div className="mx-auto max-w-5xl px-6">
          <span className="text-xs uppercase tracking-[0.3em] text-primary">About EDGE</span>
          <h1 className="mt-4 text-4xl md:text-5xl">A nonprofit for stronger utility systems and stronger people.</h1>
        </div>
      </section>
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 prose prose-slate">
          <h2>Our mission</h2>
          <p className="text-muted-foreground">
            EDGE Geospatial exists to modernize critical utility infrastructure and to train the
            workforce that operates it. We sit at the intersection of geospatial technology,
            workforce development, and public-interest partnership.
          </p>
          <h2 className="mt-10">What we do</h2>
          <ul className="text-muted-foreground space-y-2 list-disc pl-5">
            <li>Map and document aging utility networks for cities and co-ops</li>
            <li>Train job seekers in GIS, fiber, and field operations</li>
            <li>Upskill existing utility staff through industry-aligned programs</li>
            <li>Convene partners across government, education, and industry</li>
          </ul>
          <h2 className="mt-10">501(c)(3) status</h2>
          <p className="text-muted-foreground">
            EDGE Geospatial is a registered 501(c)(3) nonprofit organization. Contributions
            are tax-deductible to the extent allowed by law.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
