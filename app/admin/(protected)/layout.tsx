import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !session.organizationId) redirect("/admin/login");

  const SUPERADMIN = process.env.SUPERADMIN_SLUG ?? "admin";
  const isSuperAdmin = session.clientSlug === SUPERADMIN;

  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    include: { clients: { select: { slug: true }, orderBy: { createdAt: "asc" } } },
  });
  const slugs = org?.clients.map((c) => c.slug) ?? [];
  const bookingAppUrl = isSuperAdmin ? null : (org?.bookingAppUrl ?? null);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`
        @media (max-width: 600px) {
          .admin-nav-bar { flex-wrap: wrap !important; padding: 0.6rem 1rem !important; }
          .ew-nav-start  { min-width: 0 !important; }
          .ew-nav-end    { min-width: 0 !important; }
          .ew-nav-center {
            flex: 0 0 100% !important;
            order: 3;
            justify-content: flex-start !important;
            flex-wrap: wrap;
            gap: 0.75rem !important;
            padding-top: 0.5rem;
            border-top: 1px solid var(--border);
          }
          .ew-main { padding: 1.25rem 1rem !important; }
          .ew-preview { display: none !important; }
        }
        @media (min-width: 601px) {
          .ew-body { display: flex; align-items: flex-start; }
          .ew-content { flex: 1 1 0; min-width: 0; }
          .ew-preview {
            flex: 0 0 33vw;
            width: 33vw;
            position: sticky;
            top: 0;
            height: 100vh;
            border-left: 1px solid var(--border);
          }
          .ew-preview iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
          }
        }
      `}</style>
      <nav
        className="admin-nav-bar"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div className="ew-nav-start" style={{ flex: "0 0 auto", minWidth: 120 }}>
          {bookingAppUrl ? (
            <a href={bookingAppUrl} style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>
              ← bookingwulf
            </a>
          ) : (
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>Admin</span>
          )}
        </div>
        <div className="ew-nav-center" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "1.5rem" }}>
          <AdminNav isSuperAdmin={isSuperAdmin} slugs={slugs} activeSlug={session.clientSlug} />
        </div>
        <div className="ew-nav-end" style={{ flex: "0 0 auto", minWidth: 120, display: "flex", justifyContent: "flex-end" }}>
          <LogoutButton />
        </div>
      </nav>
      <div className="ew-body">
        <div className="ew-content">
          <main className="ew-main" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>
            {children}
          </main>
        </div>
        {!isSuperAdmin && (
          <div className="ew-preview">
            <iframe src="/" title="Vorschau" />
          </div>
        )}
      </div>
    </div>
  );
}
