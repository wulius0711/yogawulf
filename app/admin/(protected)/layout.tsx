import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "@/components/admin/LogoutButton";
import AdminNav from "@/components/admin/AdminNav";
import ThemeToggle from "@/components/admin/ThemeToggle";

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
    <div className="admin-shell" suppressHydrationWarning style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sync theme before first paint — prevents FOUC */}
      <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('admin-theme')==='dark')document.currentScript.closest('.admin-shell').setAttribute('data-theme','dark')}catch(e){}` }} />
      {/* Inter font for admin UI */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <aside style={{
        width: "220px", flexShrink: 0, background: "var(--surface)",
        borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Brand */}
        <div style={{ padding: "1.5rem 1.25rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
          {bookingAppUrl ? (
            <a href={bookingAppUrl} style={{ fontSize: "0.82rem", color: "var(--muted)", textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span>←</span> bookingwulf
            </a>
          ) : (
            <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--primary)", letterSpacing: "-0.03em" }}>
              eventwulf
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0.75rem 0.625rem", display: "flex", flexDirection: "column", gap: "2px" }}>
          <AdminNav isSuperAdmin={isSuperAdmin} slugs={slugs} activeSlug={session.clientSlug} />
        </nav>

        {/* Footer: logout + theme toggle */}
        <div className="ew-sidebar-footer">
          <LogoutButton />
          <ThemeToggle />
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "2.5rem 2.25rem", maxWidth: "960px" }}>
        {children}
      </main>
    </div>
  );
}
