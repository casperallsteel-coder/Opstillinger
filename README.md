# Opstillingsblade — All Steel by Ropox

Web-baseret system til opstillingsblade med login, SQL-database og billedupload.

## Standard Login

| Brugernavn | Adgangskode | Rolle |
|------------|------------|-------|
| `admin`    | `admin123`  | Admin (kan slette) |
| `smed`     | `smed123`   | Bruger |
| `maskin`   | `maskin123` | Bruger |
| `buk`      | `buk123`    | Bruger |

> **Skift adgangskoder** i `lib/db.js` under `defaultUsers` inden produktionsbrug!

## Hurtig Start (i GitHub Codespace)

```bash
# 1. Installer pakker
npm install

# 2. Start udviklingsserveren
npm run dev
```

Åbn derefter [http://localhost:3000](http://localhost:3000) i din browser.

## Struktur

```
lib/
  db.js        — SQLite database og alle dataoperationer
  session.js   — Login-session konfiguration
  machines.js  — Maskinskabeloner (tilføj nye her)
pages/
  index.js         — Forside med søgning
  login.js         — Login-side
  sheets/
    new.js         — Opret nyt opstillingsblad
    [id].js        — Vis og rediger opstillingsblad
  api/
    auth/          — Login/logout API
    sheets/        — Hent/opret/opdater/slet opstillingsblade
    upload.js      — Billede upload/slet
components/
  Layout.js        — Topbar og sideskal
styles/
  globals.css      — Al styling
```

## Tilføj ny maskine

Åbn `lib/machines.js` og tilføj en ny maskine i `machineTemplates`-objektet:

```js
'Svejserobot': {
  icon: '🤖',
  color: '#7c3aed',
  fields: [
    { name: 'program', label: 'Robot program', type: 'text' },
    // ...
  ]
}
```

## Data & Billeder

- Database gemmes i `data/opstillinger.db`
- Billeder gemmes i `public/uploads/`
- Begge mapper oprettes automatisk ved opstart
