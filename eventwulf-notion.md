# EventWulf

Mandantenfähige Buchungsplattform für Events und Retreats. Organisationen können ein Anfrage-Widget einbetten, eingehende Anfragen im Admin-Bereich verwalten und ihre Konfiguration (Farben, Felder, Texte) anpassen.

---

## Tech Stack

| | |
|--|--|
| **Framework** | Next.js 16 (App Router) |
| **Sprache** | TypeScript 5 |
| **Datenbank** | PostgreSQL via Neon (serverless) |
| **ORM** | Prisma 7 |
| **Auth** | JWT (jose) + httpOnly Cookies |
| **E-Mail** | Resend |
| **Styling** | Tailwind CSS 4 |
| **State** | Zustand |
| **Hosting** | Vercel |

---

## Kernfunktionen

- **Öffentliches Anfrage-Widget** – 5-schrittiger Formular-Wizard, per iframe einbettbar
- **Multi-Tenant** – eine Instanz, beliebig viele Organisationen mit eigener Konfiguration
- **Admin-Dashboard** – Anfragen verwalten, Verfügbarkeit pflegen, Widget konfigurieren
- **Kalender** – gesperrte Daten und Events mit Farbmarkierung
- **E-Mail-Benachrichtigungen** – Operator-Mail + Bestätigungs-Mail an Anfragenden
- **Autologin** – externes System (z.B. BookingWulf) kann per HMAC-signiertem Token einloggen

---

## Datenmodell

```
Organization
├── id, name, bookingAppUrl, bookingAppKey
├── → User[]         (Admin-Nutzer)
└── → Client[]       (ein Client = ein Slug = eine Konfiguration)

Client
├── id, slug (unique), config (JSON)
├── → BlockedDate[]  (Kalendereinträge)
├── → Inquiry[]      (eingehende Anfragen)
└── → Package[]      (Seminarpakete)

User
└── id, email, password (bcrypt)

Inquiry
└── id, data (JSON), status: neu | in_pruefung | bestaetigt | abgelehnt
    packageId? → Package, participantCount

Package
└── id, name, description, pricePerPerson, minParticipants, maxParticipants,
    durationDays, isActive, sortOrder

BlockedDate
└── id, startDate, endDate, label, type: blocked | event, color,
    maxCapacity?, bookedCount
```

---

## App-Struktur

### Öffentliche Seiten

| Route | Beschreibung |
|-------|-------------|
| `/` | Formular-Widget (Slug per `?slug=` Parameter) |

### Admin-Bereich (`/admin`)

| Seite | Beschreibung |
|-------|-------------|
| `/admin/login` | Login |
| `/admin` | Dashboard |
| `/admin/inquiries` | Posteingang – Anfragen mit Status-Workflow |
| `/admin/availability` | Kalender – gesperrte Daten und Events |
| `/admin/config` | Einstellungen – Firma, Farben, Formularfelder |
| `/admin/vorschau` | Live-Vorschau des Widgets |
| `/admin/packages` | Seminarpakete verwalten |
| `/admin/clients` | Superadmin: alle Organisationen verwalten |

### API-Endpunkte

| Endpunkt | Zugriff | Beschreibung |
|----------|---------|-------------|
| `POST /api/submit` | öffentlich | Formular-Einreichung |
| `GET /api/availability` | öffentlich | Kalendereinträge inkl. Kapazität für einen Slug |
| `GET /api/packages` | öffentlich | Aktive Seminarpakete für einen Slug |
| `GET /api/autologin` | HMAC-signiert | Autologin von externem System |
| `POST /api/provision` | Secret | Neue Organisation anlegen |
| `/api/admin/*` | Session | Alle Admin-Operationen |

---

## Konfigurationssystem

Jeder Client hat eine JSON-Konfiguration (`EventConfig`) die in der Datenbank gespeichert wird:

- **Firma:** Name, Tagline, Logo, E-Mail, Telefon, Website, Adresse
- **Erscheinungsbild:** Primärfarbe (generiert automatisch das gesamte Farbschema), Hintergrundfarbe, Titel-Font
- **Formular:** Welche optionalen Felder angezeigt werden
- **Dropdown-Optionen:** Verpflegung, Zimmerwunsch, Abrechnung
- **Benachrichtigung:** E-Mail-Adresse für neue Anfragen

Ladereihenfolge: DB → `config/clients/{slug}.json` → `config/clients/default.json`

---

## Formular-Wizard

| Schritt | Felder |
|---------|--------|
| 1 – Veranstaltung | Seminarpaket (optional), Art/Titel, Datum von/bis, Uhrzeit (optional) |
| 2 – Gruppe | Name, E-Mail, Personenanzahl, Leiter:innen, Telefon, Sprache |
| 3 – Ausstattung | Bestuhlung, Tische, Beamer, Soundanlage, Außenbereich, Equipment |
| 4 – Verpflegung | Verpflegungswunsch, Zimmerwunsch |
| 5 – Abschluss | Rahmenprogramm, Abrechnung, Anreise, Barrierefreiheit, Budget, Wie gefunden |

Optionale Felder werden per Konfiguration ein- und ausgeblendet.

---

## E-Mail-Flow

Bei jeder Anfrage werden zwei Mails verschickt:

1. **Operator-Mail** → an `notifyEmail` aus der Config
   - Betreff: `Neue Anfrage: {Titel} – {Name}`
   - Inhalt: alle Formulardaten als HTML-Tabelle
   - Reply-To: E-Mail des Anfragenden

2. **Bestätigungs-Mail** → an den Anfragenden (wenn E-Mail angegeben)
   - Betreff: `Anfrage bestätigt – {Titel}`
   - Inhalt: Zusammenfassung + Firmenkontaktdaten

---

## Security (Übersicht)

- JWT-Secret als Pflicht-Env-Var (kein Fallback)
- HTTP Security Headers (CSP, HSTS, X-Frame-Options, …)
- Rate Limiting auf Login, Submit und Availability
- Input-Validierung auf allen öffentlichen Endpunkten
- E-Mail-Header-Injection verhindert
- `secure`-Flag auf Cookies in allen Nicht-Dev-Umgebungen
- Passwort-Mindestlänge 8 Zeichen (bcrypt, cost 12)
- HMAC-Autologin mit Timing-Safe-Vergleich

---

## Umgebungsvariablen

| Variable | Pflicht | Beschreibung |
|----------|:-------:|-------------|
| `JWT_SECRET` | ✅ | JWT-Signing-Secret |
| `DATABASE_URL` | ✅ | PostgreSQL Connection String (Neon) |
| `RESEND_API_KEY` | ✅ | Resend API-Key |
| `NOTIFY_EMAIL` | – | Fallback-Empfänger für Anfragen |
| `PROVISIONING_SECRET` | – | Schutz für den Provision-Endpunkt |
| `SUPERADMIN_SLUG` | – | Slug des Superadmins (Standard: `admin`) |
| `NODE_ENV` | – | Von Next.js gesetzt |

---

## Geplant: Phase 3 – Teilnehmerverwaltung

Einzelne Teilnehmer hinter einer Anfrage erfassen und verwalten. Sinnvoll für Seminarbetriebe, die Zimmerzuweisung, Namenslisten und Essensplanung direkt im System abwickeln wollen.

### Datenmodell

```
Participant
└── id, inquiryId → Inquiry, firstName, lastName, email, phone,
    dietaryReq, notes, status: angemeldet | bestaetigt | abgesagt
```

### Admin

- Im Anfragen-Panel kommt unter den bestehenden Feldern eine ausklappbare **Teilnehmerliste**
- Admin kann Teilnehmer manuell hinzufügen und deren Status einzeln setzen
- **CSV-Export** der Teilnehmerliste pro Anfrage (clientseitig, keine neue Route nötig)

### Neue API-Routes

| Endpunkt | Methode | Beschreibung |
|----------|---------|-------------|
| `/api/admin/inquiries/[id]/participants` | GET, POST | Teilnehmer einer Anfrage laden / hinzufügen |
| `/api/admin/participants/[id]` | PATCH, DELETE | Einzelnen Teilnehmer bearbeiten / entfernen |

### Buchungsformular (optional)

- Neuer ausklappbarer Block in Schritt 2 – standardmäßig minimiert
- Gruppenleitung kann Teilnehmer direkt beim Einreichen erfassen
- Werden nach dem `prisma.inquiry.create()` per `createMany` gespeichert

### Prisma-Migration

```sql
CREATE TABLE Participant (
  id          TEXT PRIMARY KEY,
  inquiryId   TEXT REFERENCES Inquiry(id) ON DELETE CASCADE,
  firstName   TEXT,
  lastName    TEXT,
  email       TEXT DEFAULT '',
  phone       TEXT DEFAULT '',
  dietaryReq  TEXT DEFAULT '',
  notes       TEXT DEFAULT '',
  status      TEXT DEFAULT 'angemeldet',
  createdAt   TIMESTAMP DEFAULT NOW()
);
```
