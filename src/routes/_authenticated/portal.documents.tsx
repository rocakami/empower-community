import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/components/portal/PortalShell";
import { FileText, Download } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/portal/documents")({
  component: DocumentsPage,
});

function DocumentsPage() {
  const { data: docs = [] } = useQuery({
    queryKey: ["my-docs"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("documents")
        .select("*")
        .or(`user_id.eq.${user!.id},is_public.eq.true`)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <PortalShell title="Documents" description="Certificates, receipts, agreements, and shared resources.">
      {docs.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
          No documents yet. Certificates and receipts will appear here.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {docs.map((d) => (
            <li key={d.id} className="rounded-lg border bg-card p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 text-primary grid place-items-center">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{d.title}</div>
                <div className="text-xs text-muted-foreground">
                  {d.category ?? "Document"} · {format(new Date(d.created_at), "PP")}
                </div>
              </div>
              <a href={d.file_url} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80">
                <Download className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  );
}
