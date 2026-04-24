"use client";
import { useFormStore } from "@/store/form";
import type { YogaConfig } from "@/lib/types";

interface Props {
  config: YogaConfig;
}

export default function Step5Abschluss({ config }: Props) {
  const { form, setField } = useFormStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div>
        <label>Wünsche für Rahmenprogramm</label>
        <textarea
          rows={4}
          placeholder="Angebot für Wanderung, Backkurs, Yoga, Meditation, ..."
          value={form.wuenscheRahmenprogramm}
          onChange={(e) => setField("wuenscheRahmenprogramm", e.target.value)}
          style={{ resize: "vertical" }}
          autoFocus
        />
      </div>
      <div>
        <label>Abrechnung</label>
        <select
          value={form.abrechnung}
          onChange={(e) => setField("abrechnung", e.target.value)}
        >
          <option value="">Auswählen</option>
          {config.abrechnungOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
