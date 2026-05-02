import PackagesEditor from "@/components/admin/PackagesEditor";

export default function PackagesPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.3rem", fontWeight: 700 }}>Seminarpakete</h1>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--muted)" }}>
          Definiere buchbare Pakete, die im Anfrage-Formular zur Auswahl stehen.
        </p>
      </div>
      <PackagesEditor />
    </div>
  );
}
