"use client";
import { useFormStore } from "@/store/form";

export default function Step2Gruppe() {
  const { form, setField } = useFormStore();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label>Name Gruppenleitung *</label>
          <input
            type="text"
            value={form.nameGruppenleitung}
            onChange={(e) => setField("nameGruppenleitung", e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <label>E-Mail *</label>
          <input
            type="email"
            placeholder="E-Mail Adresse"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label>Anzahl Teilnehmer:innen</label>
          <input
            type="text"
            placeholder="z.B. 12"
            value={form.personenAnzahl}
            onChange={(e) => setField("personenAnzahl", e.target.value)}
          />
        </div>
        <div>
          <label>Leiter:innen</label>
          <input
            type="text"
            placeholder="Namen der Kursleiter:innen"
            value={form.leiterinnen}
            onChange={(e) => setField("leiterinnen", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
