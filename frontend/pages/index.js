
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useApiFetch } from '../utils/api';
import { setToken, setUser, getToken, getUser } from '../utils/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const api = useApiFetch();

  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) {
      setToken(storedToken);
      const storedUser = getUser();
      if (storedUser) setUser(storedUser);
      router.push('/feed');
    }
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setToken(data.token);
      setUser(username);
      router.push('/feed');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-shell login-shell">
      <div className="page-content card login-card">
        <h1 className="title">Entrar</h1>
        <p>Use seu usuário e senha para acessar o painel.</p>
        <form className="input-group" onSubmit={handleSubmit}>
          <label>
            Usuário
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuário" required />
          </label>
          <label>
            Senha
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" required />
          </label>
          <button type="submit">Entrar</button>
        </form>
        {error && <div className="alert">{error}</div>}
        <p style={{ marginTop: '1rem' }}>
          Não tem conta? <Link href="/register">Crie agora</Link>
        </p>
      </div>
    </div>
  );
}
