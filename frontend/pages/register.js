
import { useRouter } from 'next/router';
import { useState } from 'react';
import { apiFetch } from '../utils/api';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setMessage('Conta criada com sucesso. Redirecionando...');
      setTimeout(() => router.push('/'), 1200);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-content card">
        <h1 className="title">Criar Conta</h1>
        <form className="input-group" onSubmit={handleSubmit}>
          <label>
            Usuário
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Novo usuário" required />
          </label>
          <label>
            Senha
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" required />
          </label>
          <label>
            Confirmar Senha
            <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirme a senha" required />
          </label>
          <button type="submit">Criar Conta</button>
        </form>
        {error && <div className="alert">{error}</div>}
        {message && <div style={{ marginTop: '1rem', color: '#d1fae5' }}>{message}</div>}
      </div>
    </div>
  );
}
