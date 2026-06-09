// pages/sheets/new.js
// Opret nyt opstillingsblad

import { useState } from 'react';
import { useRouter } from 'next/router';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../../lib/session';
import { machineTemplates, machineTypeNames } from '../../lib/machines';
import Layout from '../../components/Layout';

export default function NewSheetPage({ user }) {
  const router = useRouter();
  const [maskineType, setMaskineType] = useState('');
  const [varenummer, setVarenummer] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [programnummer, setProgramnummer] = useState('');
  const [noter, setNoter] = useState('');
  const [extraData, setExtraData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const template = maskineType ? machineTemplates[maskineType] : null;

  function handleExtraChange(name, value) {
    setExtraData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!maskineType) { setError('Vælg en maskine.'); return; }
    setSaving(true);
    setError('');

    const res = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ varenummer, beskrivelse, maskine_type: maskineType, programnummer, extra_data: extraData, noter }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setError(data.error || 'Fejl ved oprettelse.'); return; }
    router.push(`/sheets/${data.id}`);
  }

  return (
    <Layout user={user} title="Nyt Opstillingsblad">
      <div className="container" style={{ maxWidth: 800 }}>
        <div className="page-header">
          <div>
            <h1>Nyt Opstillingsblad</h1>
            <p>Udfyld felterne nedenfor</p>
          </div>
          <button className="btn btn-secondary" onClick={() => router.back()}>← Tilbage</button>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ── MASKINVALG ── */}
          <div className="form-card" style={{ marginBottom: '1.25rem' }}>
            <div className="form-section-title">Vælg Maskine *</div>
            <div className="machine-selector">
              {machineTypeNames.map(name => {
                const t = machineTemplates[name];
                return (
                  <div
                    key={name}
                    className={`machine-option ${maskineType === name ? 'selected' : ''}`}
                    onClick={() => setMaskineType(name)}
                    style={maskineType === name ? { borderColor: t.color } : {}}
                  >
                    <span className="icon">{t.icon}</span>
                    <span className="name">{name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── BASIS INFO ── */}
          <div className="form-card" style={{ marginBottom: '1.25rem' }}>
            <div className="form-section-title">Generel Information</div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="varenummer">Varenummer *</label>
                <input id="varenummer" type="text" value={varenummer} onChange={e => setVarenummer(e.target.value)} placeholder="F.eks. ROP-12345" required />
              </div>
              <div className="form-group">
                <label htmlFor="programnummer">Programnummer <span className="optional">(valgfrit)</span></label>
                <input id="programnummer" type="text" value={programnummer} onChange={e => setProgramnummer(e.target.value)} placeholder="F.eks. O5001" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="beskrivelse">Beskrivelse <span className="optional">(valgfrit)</span></label>
              <input id="beskrivelse" type="text" value={beskrivelse} onChange={e => setBeskrivelse(e.target.value)} placeholder="Kort beskrivelse af emnet" />
            </div>
          </div>

          {/* ── MASKINSPECIFIKKE FELTER ── */}
          {template && (
            <div className="form-card" style={{ marginBottom: '1.25rem', borderTop: `3px solid ${template.color}` }}>
              <div className="form-section-title" style={{ color: template.color }}>
                {template.icon} {maskineType} — Opstillingsinformation
              </div>
              {template.fields.map(field => (
                <div className="form-group" key={field.name}>
                  <label htmlFor={field.name}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      value={extraData[field.name] || ''}
                      onChange={e => handleExtraChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.name}
                      value={extraData[field.name] || ''}
                      onChange={e => handleExtraChange(field.name, e.target.value)}
                    >
                      <option value="">— Vælg —</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      id={field.name}
                      type={field.type}
                      value={extraData[field.name] || ''}
                      onChange={e => handleExtraChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── NOTER ── */}
          <div className="form-card" style={{ marginBottom: '1.25rem' }}>
            <div className="form-section-title">Noter <span style={{ fontWeight: 400, textTransform: 'none', color: '#9ca3af', fontSize: '0.75rem' }}>(valgfrit)</span></div>
            <textarea
              value={noter}
              onChange={e => setNoter(e.target.value)}
              placeholder="Ekstra noter, advarsler, husk-på..."
              rows={3}
            />
          </div>

          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1rem' }}>
            * Du kan tilføje billeder efter oprettelse.
          </p>

          <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
            {saving ? 'Opretter...' : '✓ Opret Opstillingsblad'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ req, res }) {
  const session = await getIronSession(req, res, sessionOptions);
  if (!session.user) return { redirect: { destination: '/login', permanent: false } };
  return { props: { user: session.user } };
}
