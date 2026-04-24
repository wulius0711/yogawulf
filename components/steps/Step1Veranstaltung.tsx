"use client";
import { useFormStore } from "@/store/form";
import Calendar from "@/components/Calendar";
import type { YogaConfig } from "@/lib/types";

interface Props {
  slug: string;
  config: YogaConfig;
}

const HOURS = Array.from({ length: 19 }, (_, i) => {
  const h = i + 6;
  return `${String(h).padStart(2, "0")}:00`;
});

function fmtDate(iso: string) {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

export default function Step1Veranstaltung({ slug, config }: Props) {
  const { form, setField } = useFormStore();

  const selectedStart = form.datumVon ? new Date(form.datumVon + "T12:00:00") : null;
  const selectedEnd = form.datumBis ? new Date(form.datumBis + "T12:00:00") : null;
  const showUhrzeiten = config.formFields?.uhrzeiten !== false;

  function localISO(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function handleRangeChange(start: Date | null, end: Date | null) {
    setField("datumVon", start ? localISO(start) : "");
    setField("datumBis", end ? localISO(end) : "");
  }

  const hasRange = form.datumVon || form.datumBis;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <label>Art / Titel der Veranstaltung *</label>
        <input type="text" value={form.artTitel} onChange={(e) => setField("artTitel", e.target.value)} placeholder="z.B. Yoga-Retreat, Teambuilding, Meditation-Wochenende" autoFocus />
      </div>

      <div>
        <label style={{ marginBottom: "0.5rem", display: "block" }}>Zeitraum wählen</label>
        <Calendar slug={slug} selectedStart={selectedStart} selectedEnd={selectedEnd} onRangeChange={handleRangeChange} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", background: hasRange ? "var(--primary-tint)" : "var(--bg2)", border: `1px solid ${hasRange ? "var(--primary-dim)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", padding: "0.85rem 1rem", transition: "all 0.2s" }}>
        <div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "0.2rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Anreise</div>
          <div style={{ fontWeight: 600, fontSize: "0.95rem", color: hasRange ? "var(--primary)" : "var(--muted)" }}>{fmtDate(form.datumVon)}</div>
        </div>
        <div>
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "0.2rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Abreise</div>
          <div style={{ fontWeight: 600, fontSize: "0.95rem", color: hasRange ? "var(--primary)" : "var(--muted)" }}>{fmtDate(form.datumBis)}</div>
        </div>
      </div>

      {showUhrzeiten && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label>Veranstaltungsbeginn (Uhrzeit)</label>
            <select value={form.zeitVon} onChange={(e) => setField("zeitVon", e.target.value)}>
              <option value="">Uhrzeit wählen</option>
              {HOURS.map((h) => <option key={h} value={h}>{h} Uhr</option>)}
            </select>
          </div>
          <div>
            <label>Veranstaltungsende (Uhrzeit)</label>
            <select value={form.zeitBis} onChange={(e) => setField("zeitBis", e.target.value)}>
              <option value="">Uhrzeit wählen</option>
              {HOURS.map((h) => <option key={h} value={h}>{h} Uhr</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
