
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';
import { getUser, getToken } from '../utils/auth';
import { useRouter } from 'next/router';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState('');

  useEffect(() => {
    if (!getToken()) {
      router.push('/');
      return;
    }
    setUser(getUser() || 'usuário');
  }, [router]);

  return (
    <Layout title="Dashboard">
      <div className="card">
        <h2>Bem-vindo, {user}</h2>
        <p>Esta é a camada de apresentação do seu projeto em Next.js.</p>
        <div className="nav-grid">
          {[
            { href: '/feed', label: 'Feed' },
            { href: '/profile', label: 'Perfil' },
            { href: '/calendar', label: 'Calendário' },
            { href: '/diary', label: 'Diário' },
            { href: '/messages', label: 'Mensagens' },
            { href: '/settings', label: 'Configurações' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="nav-card">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <FooterNav />
    </Layout>
  );
}
