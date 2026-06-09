// lib/db.js
// SQLite database setup, schema og alle database-funktioner

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Gem database-fil i /data mappen
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'opstillinger.db');
const db = new Database(dbPath);

// Aktiver foreign keys og WAL mode for bedre performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================================
// OPRET TABELLER
// ============================================================
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    varenummer TEXT NOT NULL,
    beskrivelse TEXT,
    maskine_type TEXT NOT NULL,
    programnummer TEXT,
    extra_data TEXT DEFAULT '{}',
    noter TEXT,
    created_by TEXT,
    updated_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sheet_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT,
    caption TEXT,
    uploaded_at TEXT DEFAULT (datetime('now')),
    uploaded_by TEXT,
    FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sheets_varenummer ON sheets(varenummer);
  CREATE INDEX IF NOT EXISTS idx_sheets_maskine ON sheets(maskine_type);
  CREATE INDEX IF NOT EXISTS idx_images_sheet ON images(sheet_id);
`);

// ============================================================
// OPRET STANDARD BRUGERE (hvis de ikke findes)
// ============================================================
const defaultUsers = [
  { username: 'admin',  display_name: 'Administrator', password: 'admin123',  role: 'admin' },
  { username: 'smed',   display_name: 'Smed',          password: 'smed123',   role: 'user'  },
  { username: 'maskin', display_name: 'Maskin',         password: 'maskin123', role: 'user'  },
  { username: 'buk',    display_name: 'Buk',            password: 'buk123',    role: 'user'  },
];

const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (username, password_hash, display_name, role)
  VALUES (?, ?, ?, ?)
`);

for (const u of defaultUsers) {
  const hash = bcrypt.hashSync(u.password, 10);
  insertUser.run(u.username, hash, u.display_name, u.role);
}

// ============================================================
// BRUGER FUNKTIONER
// ============================================================
export function getUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function validatePassword(plaintext, hash) {
  return bcrypt.compareSync(plaintext, hash);
}

// ============================================================
// OPSTILLINGSBLAD FUNKTIONER
// ============================================================
export function getAllSheets(search = '') {
  if (search) {
    return db.prepare(`
      SELECT * FROM sheets
      WHERE varenummer LIKE ? OR beskrivelse LIKE ? OR programnummer LIKE ? OR maskine_type LIKE ?
      ORDER BY updated_at DESC
    `).all(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  return db.prepare('SELECT * FROM sheets ORDER BY updated_at DESC').all();
}

export function getSheetById(id) {
  return db.prepare('SELECT * FROM sheets WHERE id = ?').get(id);
}

export function createSheet(data) {
  const stmt = db.prepare(`
    INSERT INTO sheets (varenummer, beskrivelse, maskine_type, programnummer, extra_data, noter, created_by, updated_by)
    VALUES (@varenummer, @beskrivelse, @maskine_type, @programnummer, @extra_data, @noter, @created_by, @updated_by)
  `);
  const result = stmt.run({
    varenummer: data.varenummer,
    beskrivelse: data.beskrivelse || '',
    maskine_type: data.maskine_type,
    programnummer: data.programnummer || '',
    extra_data: JSON.stringify(data.extra_data || {}),
    noter: data.noter || '',
    created_by: data.created_by || '',
    updated_by: data.created_by || '',
  });
  return result.lastInsertRowid;
}

export function updateSheet(id, data) {
  db.prepare(`
    UPDATE sheets SET
      varenummer = @varenummer,
      beskrivelse = @beskrivelse,
      maskine_type = @maskine_type,
      programnummer = @programnummer,
      extra_data = @extra_data,
      noter = @noter,
      updated_by = @updated_by,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id,
    varenummer: data.varenummer,
    beskrivelse: data.beskrivelse || '',
    maskine_type: data.maskine_type,
    programnummer: data.programnummer || '',
    extra_data: JSON.stringify(data.extra_data || {}),
    noter: data.noter || '',
    updated_by: data.updated_by || '',
  });
}

export function deleteSheet(id) {
  db.prepare('DELETE FROM sheets WHERE id = ?').run(id);
}

// ============================================================
// BILLED FUNKTIONER
// ============================================================
export function getImagesBySheetId(sheetId) {
  return db.prepare('SELECT * FROM images WHERE sheet_id = ? ORDER BY uploaded_at ASC').all(sheetId);
}

export function addImage(sheetId, filename, originalName, uploadedBy, caption = '') {
  const stmt = db.prepare(`
    INSERT INTO images (sheet_id, filename, original_name, uploaded_by, caption)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(sheetId, filename, originalName, uploadedBy, caption);
  return result.lastInsertRowid;
}

export function deleteImage(imageId) {
  const img = db.prepare('SELECT * FROM images WHERE id = ?').get(imageId);
  db.prepare('DELETE FROM images WHERE id = ?').run(imageId);
  return img; // returner filnavnet så vi kan slette filen fra disk
}

export default db;
