// components/Layout.js
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function Layout({ children, user, title = 'Opstillingsblade' }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <>
      <Head>
        <title>{title} — All Steel by Ropox</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Opstillingsblade system — All Steel by Ropox" />
      </Head>

      <header className="topbar">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="logo">
            <span className="logo-main">all steel</span>
            <span className="logo-sub">BY ROPOX</span>
          </div>
        </Link>

        <div className="topbar-right">
          {user && (
            <>
              <div className="user-badge">
                <span className="dot" />
                <span>{user.display_name}</span>
                {user.role === 'admin' && (
                  <span className="badge badge-red" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Admin</span>
                )}
              </div>
              <button className="btn-ghost btn" onClick={handleLogout} style={{ fontSize: '0.85rem' }}>
                Log ud
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        {children}
      </main>
    </>
  );
}
