"use client";
import { usePathname } from "next/navigation";

interface Props {
  isSuperAdmin: boolean;
}

const links = [
  { href: "/admin/config",       label: "Einstellungen" },
  { href: "/admin/availability", label: "Verfügbarkeit" },
  { href: "/admin/inquiries",    label: "Anfragen" },
];

export default function AdminNav({ isSuperAdmin }: Props) {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <a key={href} href={href} style={{
            fontSize: "0.85rem",
            color: active ? "var(--text)" : "var(--muted)",
            textDecoration: "none",
            fontWeight: active ? 700 : 400,
          }}>
            {label}
          </a>
        );
      })}
      {isSuperAdmin && (
        <a href="/admin/clients" style={{
          fontSize: "0.85rem",
          color: pathname.startsWith("/admin/clients") ? "var(--text)" : "var(--muted)",
          textDecoration: "none",
          fontWeight: pathname.startsWith("/admin/clients") ? 700 : 400,
        }}>
          Kunden
        </a>
      )}
      <a href="/" target="_blank" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>
        Vorschau ↗
      </a>
    </>
  );
}
