// pages/sheets/[id].js
// Visning og redigering af et enkelt opstillingsblad

import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../lib/session';
import { getSheetById, getImagesBySheetId } from '../../lib/db';
import { machineTemplates } from '../../lib/machines';
import Layout from '../../components/Layout';

export default function SheetDetailPage({ user, sheet: initialSheet, images: initialImages }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [sheet, setSheet] = useState(initialSheet);
  const [images, setImages] = useState(initialImages);
  const [formData, setFormData] = useState({ ...initialSheet });
  const [extraData, setExtraData] = useState({ ...initialSheet.extra_data });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const template = machineTemplates[sheet.maskine_type];

  // ── Gem redigering ──
  async function handleSave() {
    setSaving(true);
    setError('');
    const res = await fetch(`/api/sheets/${sheet.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, extra_data: extraData }),
    });
    setSaving(false);
    if (!res.ok) { setError('Kunne ikke gemme.'); return; }
    // Opdater visning
    setSheet({ ...formData, extra_data: extraData, updated_by: user.display_name, updated_at: new Date().toISOString() });
    setEditing(false);
  }

  // ── Upload billede ──
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('sheet_id', sheet.id);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (!res.ok) { alert('Fejl ved upload af billede.'); return; }
    const img = await res.json();
    setImages(prev => [...prev, { id: img.id, filename: img.filename, uploaded_by: user.display_name }]);
  }

  // ── Slet billede ──
  async function handleDeleteImage(imageId) {
    if (!confirm('Slet dette billede?')) return;
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_id: imageId }),
    });
    setImages(prev => prev.filter(i => i.id !== imageId));
  }

  // ── Slet opstillingsblad ──
  async function handleDeleteSheet() {
    if (!confirm(`Er du sikker på, at du vil slette opstillingsblad "${sheet.varenummer}"? Dette kan ikke fortrydes.`)) return;
    await fetch(`/api/sheets/${sheet.id}`, { method: 'DELETE' });
    router.push('/');
  }

  const dato = (dt) => new Date(dt).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <Layout user={user} title={sheet.varenummer}>
      <div className="container" style={{ maxWidth: 850 }}>
        {/* ── HEADER ── */}
        <div className="detail-header">
          <div>
            <div className="detail-vare">{sheet.varenummer}</div>
            <div className="detail-meta">
              <span className="machine-badge" style={{ color: template?.color }}>
                {template?.icon} {sheet.maskine_type}
              </span>
              {sheet.programnummer && (
                <span className="badge badge-red">Prog: {sheet.programnummer}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {!editing && (
              <>
                <button className="btn btn-secondary" onClick={() => router.push('/')}>← Tilbage</button>
                <button className="btn btn-primary" onClick={() => setEditing(true)}>✏️ Rediger</button>
                {user.role === 'admin' && (
                  <button className="btn btn-danger" onClick={handleDeleteSheet}>🗑 Slet</button>
                )}
              </>
            )}
            {editing && (
              <>
                <button className="btn btn-secondary" onClick={() => { setEditing(false); setFormData({...sheet}); setExtraData({...sheet.extra_data}); }}>Annuller</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Gemmer...' : '✓ Gem Ændringer'}</button>
              </>
            )}
          </div>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

        {/* ── GENERELLE INFO ── */}
        <div className="form-card" style={{ marginBottom: '1.25rem' }}>
          <div className="form-section-title">Generel Information</div>

          {editing ? (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label>Varenummer *</label>
                  <input type="text" value={formData.varenummer} onChange={e => setFormData(p => ({...p, varenummer: e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Programnummer</label>
                  <input type="text" value={formData.programnummer || ''} onChange={e => setFormData(p => ({...p, programnummer: e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label>Beskrivelse</label>
                <input type="text" value={formData.beskrivelse || ''} onChange={e => setFormData(p => ({...p, beskrivelse: e.target.value}))} />
              </div>
            </div>
          ) : (
            <div className="info-grid">
              <div className="info-box">
                <div className="label">Varenummer</div>
                <div className="value">{sheet.varenummer}</div>
              </div>
              {sheet.programnummer && (
                <div className="info-box">
                  <div className="label">Programnummer</div>
                  <div className="value">{sheet.programnummer}</div>
                </div>
              )}
              {sheet.beskrivelse && (
                <div className="info-box" style={{ gridColumn: 'span 2' }}>
                  <div className="label">Beskrivelse</div>
                  <div className="value">{sheet.beskrivelse}</div>
                </div>
              )}
              <div className="info-box">
                <div className="label">Oprettet af</div>
                <div className="value">{sheet.created_by || '—'}</div>
              </div>
              <div className="info-box">
                <div className="label">Sidst opdateret</div>
                <div className="value" style={{ fontSize: '0.85rem' }}>{dato(sheet.updated_at)} af {sheet.updated_by || '—'}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── MASKINSPECIFIKKE FELTER ── */}
        {template && (
          <div className="form-card" style={{ marginBottom: '1.25rem', borderTop: `3px solid ${template.color}` }}>
            <div className="form-section-title" style={{ color: template.color }}>
              {template.icon} {sheet.maskine_type} — Opstillingsinformation
            </div>

            {editing ? (
              template.fields.map(field => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea value={extraData[field.name] || ''} onChange={e => setExtraData(p => ({...p, [field.name]: e.target.value}))} placeholder={field.placeholder} />
                  ) : field.type === 'select' ? (
                    <select value={extraData[field.name] || ''} onChange={e => setExtraData(p => ({...p, [field.name]: e.target.value}))}>
                      <option value="">— Vælg —</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} value={extraData[field.name] || ''} onChange={e => setExtraData(p => ({...p, [field.name]: e.target.value}))} placeholder={field.placeholder} />
                  )}
                </div>
              ))
            ) : (
              <div>
                {/* Vis nulpunkter separat hvis de er G-koder */}
                {['g54','g55','g56','g57'].some(g => sheet.extra_data[g]) && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.75rem' }}>Nulpunkter</h3>
                    <div className="nulpunkter-grid">
                      {['g54','g55','g56','g57'].map(g => sheet.extra_data[g] ? (
                        <div className="nulpunkt-box" key={g}>
                          <div className="g-label">{g.toUpperCase()}</div>
                          <div className="g-value">{sheet.extra_data[g]}</div>
                        </div>
                      ) : null)}
                    </div>
                  </div>
                )}

                {/* Vis alle andre felter */}
                <div className="info-grid" style={{ marginBottom: '1rem' }}>
                  {template.fields
                    .filter(f => !['g54','g55','g56','g57','vaerktoejsliste','bojesekvens'].includes(f.name))
                    .filter(f => sheet.extra_data[f.name])
                    .map(field => (
                      <div className="info-box" key={field.name}>
                        <div className="label">{field.label}</div>
                        <div className="value">{sheet.extra_data[field.name]}</div>
                      </div>
                    ))}
                </div>

                {/* Vis Bøjesekvens /Værktøjsliste som kodeblok */}
                {(sheet.extra_data.vaerktoejsliste || sheet.extra_data.bojesekvens) && (
                  <div>
                    <h3 style={{ marginBottom: '0.75rem' }}>
                      {sheet.extra_data.vaerktoejsliste ? 'Værktøjsliste' : 'Bøjesekvens'}
                    </h3>
                    <div className="tools-box">
                      {sheet.extra_data.vaerktoejsliste || sheet.extra_data.bojesekvens}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── NOTER ── */}
        {(editing || sheet.noter) && (
          <div className="form-card" style={{ marginBottom: '1.25rem' }}>
            <div className="form-section-title">Noter</div>
            {editing ? (
              <textarea value={formData.noter || ''} onChange={e => setFormData(p => ({...p, noter: e.target.value}))} placeholder="Ekstra noter, advarsler, husk-på..." rows={3} />
            ) : (
              <p style={{ whiteSpace: 'pre-wrap', color: '#374151' }}>{sheet.noter}</p>
            )}
          </div>
        )}

        {/* ── BILLEDER ── */}
        <div className="form-card">
          <div className="form-section-title">Billeder af Opstilling</div>

          <div className="image-grid">
            {images.map(img => (
              <div className="image-thumb" key={img.id}>
                <img src={`/uploads/${img.filename}`} alt="Opstillingsbillede" loading="lazy" />
                <button className="del-btn" onClick={() => handleDeleteImage(img.id)} title="Slet billede">✕</button>
              </div>
            ))}
          </div>

          <div
            className="image-upload-area"
            style={{ marginTop: images.length > 0 ? '1rem' : 0 }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">{uploading ? '⏳' : '📸'}</div>
            <p><strong>{uploading ? 'Uploader...' : 'Tryk for at uploade billede'}</strong></p>
            <p>Virker med kamera på telefon — maks. 20 MB</p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ req, res, params }) {
  const session = await getIronSession(req, res, sessionOptions);
  if (!session.user) return { redirect: { destination: '/login', permanent: false } };

  const sheet = getSheetById(params.id);
  if (!sheet) return { notFound: true };

  const images = getImagesBySheetId(params.id);

  return {
    props: {
      user: session.user,
      sheet: {
        ...sheet,
        extra_data: JSON.parse(sheet.extra_data || '{}'),
      },
      images,
    },
  };
}
