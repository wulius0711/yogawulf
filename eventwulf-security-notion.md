# EventWulf – Security Hardening

## Überblick

Im Rahmen eines Security-Audits wurden alle kritischen und hohen Schwachstellen in EventWulf identifiziert und behoben. Dieser Bericht dokumentiert die durchgeführten Maßnahmen.

---

## Durchgeführte Maßnahmen

### 1. Fallback-JWT-Secret entfernt

**Problem:** Der Code enthielt ein hardcodiertes Fallback-Secret (`"fallback-secret"`), das beim Fehlen der Umgebungsvariable verwendet wurde. Damit wäre es möglich gewesen, beliebige gültige JWT-Tokens zu fälschen.

**Fix:** Die App wirft beim Start jetzt einen expliziten Fehler, wenn `JWT_SECRET` nicht gesetzt ist. Kein Fallback möglich.

---

### 2. HTTP Security Headers

**Problem:** `next.config.ts` war leer — keine Security Headers.

**Fix:** Folgende Headers werden jetzt für alle Routen gesetzt:

| Header | Wert |
|--------|------|
| Content-Security-Policy | `default-src 'self'; ...` |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` |
| X-Frame-Options | `DENY` |
| X-Content-Type-Options | `nosniff` |
| X-XSS-Protection | `1; mode=block` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` |

---

### 3. E-Mail-Header-Injection verhindert

**Problem:** Nutzereingaben (`artTitel`, `nameGruppenleitung`) wurden ungefiltert in E-Mail-Subjects eingebaut. Über Zeilenumbrüche (`\r\n`) hätten Angreifer zusätzliche E-Mail-Header (z.B. BCC) injizieren können.

**Fix:** Neue `sanitize()`-Funktion entfernt alle `\r`, `\n` und `\t` Zeichen aus sämtlichen user-kontrollierten Feldern vor dem E-Mail-Versand.

---

### 4. Rate Limiting

**Problem:** Keine Begrenzung von Anfragen auf öffentlichen Endpunkten — anfällig für Brute Force und Spam.

**Fix:** In-Memory Sliding-Window Rate Limiter (`lib/ratelimit.ts`) ohne externe Abhängigkeit:

| Endpunkt | Limit |
|----------|-------|
| `POST /api/admin/login` | 5 Versuche / 15 Minuten |
| `POST /api/submit` | 5 Anfragen / 10 Minuten |
| `GET /api/availability` | 30 Anfragen / Minute |

Bei Überschreitung: HTTP 429.

---

### 5. Input-Validierung

**Problem:** Öffentliche und Admin-Endpunkte akzeptierten beliebige Daten ohne Prüfung.

**Fix:** Neue `lib/validate.ts` mit Validierungsfunktionen für alle kritischen Endpunkte:

- **`/api/submit`:** Pflichtfelder (`artTitel`, `nameGruppenleitung`, `datumVon`, `datumBis`), E-Mail-Format, ISO-Datumsformat, Feldlängen
- **`/api/admin/config` PUT:** Schema-Prüfung gegen `YogaConfig`-Struktur vor DB-Write

---

### 6. Cookie `secure`-Flag korrigiert

**Problem:** Das `secure`-Flag auf Session-Cookies war nur in `NODE_ENV === "production"` aktiv. Staging- und UAT-Umgebungen sendeten Cookies über unverschlüsseltes HTTP.

**Fix:** Cookie-Konfiguration in `cookieOptions()` zentralisiert (`lib/auth.ts`). `secure` ist jetzt in allen Umgebungen außer `development` aktiv. Login, Switch-Slug und Autologin nutzen alle dieselbe Funktion.

---

### 7. Passwort-Mindestlänge

**Problem:** Bei Passwort-Änderung und Neuanlage von Accounts gab es keine Validierung der Passwort-Stärke.

**Fix:** `validatePassword()` erzwingt min. 8 und max. 128 Zeichen. Gilt für:
- Passwort-Änderung im Admin-Account
- Anlage neuer Clients/Organisationen (Superadmin)

---

## Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `lib/auth.ts` | Fallback-Secret entfernt; `cookieOptions()` hinzugefügt |
| `lib/ratelimit.ts` | **Neu** – In-Memory Rate Limiter |
| `lib/validate.ts` | **Neu** – Validierungsfunktionen |
| `next.config.ts` | Security Headers für alle Routen |
| `app/api/submit/route.ts` | Rate Limit + Input-Validierung + `sanitize()` |
| `app/api/admin/login/route.ts` | Rate Limit + `cookieOptions()` |
| `app/api/admin/switch-slug/route.ts` | `cookieOptions()` |
| `app/api/admin/account/route.ts` | Passwort-Validierung |
| `app/api/admin/clients/route.ts` | Passwort-Validierung |
| `app/api/admin/config/route.ts` | Config-Schema-Validierung |
| `app/api/autologin/route.ts` | `cookieOptions()` |
| `app/api/availability/route.ts` | Rate Limit |

---

## Bewusst nicht umgesetzt

| Punkt | Begründung |
|-------|-----------|
| Globales Rate Limiting | In-Memory reicht als erste Schutzschicht; für Multi-Instanz-Schutz wäre Upstash Redis nötig |
| CSRF-Tokens | Durch `sameSite=lax` + `httpOnly` Cookies ausreichend abgedeckt |
| Audit-Log | Nice-to-have, kein akutes Sicherheitsrisiko |

---

## Bereits korrekt implementiert (vor dem Audit)

- HMAC-Autologin mit `timingSafeEqual` (verhindert Timing-Angriffe)
- Prisma ORM — kein Risiko für SQL-Injection
- Slug-Sanitierung mit Regex `/^[a-z0-9-]+$/`
- bcryptjs mit cost factor 12
- Status-Wert-Validierung im Inquiries-Endpunkt
