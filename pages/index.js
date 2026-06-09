// pages/index.js
// Forsiden — søgning og oversigt over opstillingsblade

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../lib/session';
import { machineTemplates } from '../lib/machines';
import Layout from '../components/Layout';
import Link from 'next/link';

const machineColors = Object.fromEntries(
  Object.entries(machineTemplates).map(([name, t]) => [name, t.color])
);

function SheetCard({ sheet, onClick }) {
  const color = machineColors[sheet.maskine_type] || '#C81F27';
  const icon = machineTemplates[sheet.maskine_type]?.icon || '📋';
  const date = new Date(sheet.updated_at).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div
      className="sheet-card"
      style={{ '--machine-color': color }}
      onClick={() => onClick(sheet.id)}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(sheet.id)}
      role="button"
    >
      <div className="sheet-card-vare">{sheet.varenummer}</div>
      <div className="sheet-card-desc">{sheet.beskrivelse || 'Ingen beskrivelse'}</div>
      <div className="sheet-card-footer">
        <span className="machine-badge">{icon} {sheet.maskine_type}</span>
        <span className="date-label">{date}</span>
      </div>
      {sheet.programnummer && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>
          Prog: {sheet.programnummer}
        </div>
      )}
    </div>
  );
}

export default function IndexPage({ user }) {
  const router = useRouter();
  const [sheets, setSheets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSheets = useCallback(async (q = '') => {
    setLoading(true);
    const res = await fetch(`/api/sheets?search=${encodeURIComponent(q)}`);
    if (res.ok) setSheets(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => fetchSheets(search), 300);
    return () => clearTimeout(delay);
  }, [search, fetchSheets]);

  return (
    <Layout user={user} title="Forsiden">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Opstillingsblade</h1>
            <p style={{ marginTop: '0.25rem' }}>
              {loading ? 'Henter...' : `${sheets.length} opstillingsblad${sheets.length !== 1 ? 'e' : ''}`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                type="text"
                placeholder="Søg på varenummer, maskine, program..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="search"
              />
            </div>

            <Link href="/sheets/new" className="btn btn-primary">
              + Nyt Opstillingsblad
            </Link>
          </div>
        </div>

        {!loading && sheets.length === 0 && (
          <div className="empty-state">
            <span className="icon">📋</span>
            <h3>{search ? 'Ingen resultater' : 'Ingen opstillingsblade endnu'}</h3>
            <p>
              {search
                ? `Prøv en anden søgning.`
                : 'Klik "Nyt Opstillingsblad" for at oprette det første.'}
            </p>
          </div>
        )}

        <div className="sheets-grid">
          {sheets.map(sheet => (
            <SheetCard
              key={sheet.id}
              sheet={sheet}
              onClick={id => router.push(`/sheets/${id}`)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ req, res }) {
  const session = await getIronSession(req, res, sessionOptions);
  if (!session.user) return { redirect: { destination: '/login', permanent: false } };
  return { props: { user: session.user } };
}
