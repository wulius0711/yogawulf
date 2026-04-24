"use client";
import { useFormStore } from "@/store/form";

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <label>{label}</label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {(["Ja", "Nein"] as const).map((opt) => {
          const val = opt === "Ja";
          const active = value === val;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(val)}
              style={{
                flex: 1,
                padding: "0.65rem",
                border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
                background: active ? "var(--primary-tint)" : "var(--surface)",
                color: active ? "var(--primary)" : "var(--muted)",
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.15s",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Step3Ausstattung() {
  const { form, setField } = useFormStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <YesNo
          label="Bestuhlung"
          value={form.bestuhlung}
          onChange={(v) => setField("bestuhlung", v)}
        />
        <YesNo
          label="Tische"
          value={form.tische}
          onChange={(v) => setField("tische", v)}
        />
      </div>
      <div>
        <label>Sonstiges Equipment</label>
        <textarea
          rows={4}
          placeholder="bspw. Flipchart, Beamer, Yogamatten, Meditationskissen, ..."
          value={form.sonstigesEquipment}
          onChange={(e) => setField("sonstigesEquipment", e.target.value)}
          style={{ resize: "vertical" }}
        />
      </div>
    </div>
  );
}
