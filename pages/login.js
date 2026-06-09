// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '../lib/session';
import Head from 'next/head';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Forkert brugernavn eller adgangskode.');
    } else {
      router.push('/');
    }
  }

  return (
    <>
      <Head>
        <title>Log ind — All Steel by Ropox</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <span className="logo-main">all steel</span>
            <p className="subtitle">Opstillingsblade System</p>
          </div>

          {error && <div className="error-msg">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Brugernavn</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="off"
                placeholder="F.eks. smed"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Adgangskode</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? 'Logger ind...' : 'Log ind'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', textAlign: 'center', color: '#9ca3af' }}>
            All Steel by Ropox — Opstillingsblade v2
          </p>
        </div>
      </div>
    </>
  );
}

// Redirect til forsiden hvis allerede logget ind
export async function getServerSideProps({ req, res }) {
  const session = await getIronSession(req, res, sessionOptions);
  if (session.user) {
    return { redirect: { destination: '/', permanent: false } };
  }
  return { props: {} };
}
