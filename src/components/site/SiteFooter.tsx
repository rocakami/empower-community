import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="brand-mark text-foreground mb-3">EDGE GEOSPATIAL</div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Modernizing utility systems and building the workforce required to sustain them.
            A registered 501(c)(3) nonprofit.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Organization</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
            <li><Link to="/events" className="hover:text-primary">Events</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Get involved</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth" className="hover:text-primary">Member portal</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Partner with us</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Volunteer</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} EDGE Geospatial. All rights reserved.</span>
          <span>501(c)(3) nonprofit</span>
        </div>
      </div>
    </footer>
  );
}
