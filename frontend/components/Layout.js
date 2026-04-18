
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout, getToken } from '../utils/auth';

export default function Layout({ children, title }) {
  const router = useRouter();
  const isAuth = Boolean(getToken());

  return (
    <div className="page-shell">
      <header className="toolbar">
        <div>
          <h1 className="title">Arcanjo</h1>
          {title && <p>{title}</p>}
        </div>
        <div>
          <Link href="/dashboard" className="footer-link">Dashboard</Link>
          {isAuth ? (
            <button type="button" onClick={() => { logout(); router.push('/'); }} className="footer-link">
              Sair
            </button>
          ) : (
            <Link href="/" className="footer-link">Entrar</Link>
          )}
        </div>
      </header>
      <main className="page-content">{children}</main>
    </div>
  );
}
