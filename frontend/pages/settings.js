import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';
import { getUser, getToken } from '../utils/auth';
import { useRouter } from 'next/router';

export default function SettingsPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (!getToken()) {
      router.replace('/');
      return;
    }

    setUsername(getUser() || '');
    setTheme(localStorage.getItem('arcanjo_theme') || 'dark');
  }, [router]);

  function handleThemeChange(value) {
    setTheme(value);
    localStorage.setItem('arcanjo_theme', value);
    document.documentElement.dataset.theme = value;
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/');
  }

  return (
    <Layout title="Configurações">
      <div className="card">
        <h2>Configurações</h2>
        <p>Gerencie sua conta, tema e preferências da rede social.</p>

        <div className="input-group">
          <label>
            Usuário logado
            <input value={username} disabled />
          </label>

          <label>
            Tema
            <select value={theme} onChange={(e) => handleThemeChange(e.target.value)}>
              <option value="dark">Escuro</option>
              <option value="light">Claro</option>
            </select>
          </label>

          <button type="button" onClick={() => router.push('/profile')}>
            Ver perfil
          </button>

          <button type="button" onClick={handleLogout}>
            Sair da conta
          </button>
        </div>
      </div>

      <FooterNav />
    </Layout>
  );
}