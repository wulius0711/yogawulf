import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";

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
      <AdminShell bookingAppUrl={bookingAppUrl} isSuperAdmin={isSuperAdmin} slugs={slugs} activeSlug={session.clientSlug}>
        {children}
      </AdminShell>
    </div>
  );
}
