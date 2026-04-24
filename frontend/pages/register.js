import { useRouter } from 'next/router';
import { useState } from 'react';
import { apiFetch } from '../utils/api';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    if (form.username.trim().length < 3) {
      return 'O usuário precisa ter pelo menos 3 caracteres.';
    }

    if (form.password.length < 6) {
      return 'A senha precisa ter pelo menos 6 caracteres.';
    }

    if (form.password !== form.confirmPassword) {
      return 'As senhas não coincidem.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });

      setMessage('Conta criada com sucesso. Redirecionando...');
      setTimeout(() => router.push('/'), 1200);
    } catch (err) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-content card">
        <h1 className="title">Criar Conta</h1>
        <p>Entre para a rede social Arcanjo e publique seus projetos.</p>

        <form className="input-group" onSubmit={handleSubmit}>
          <label>
            Usuário
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Novo usuário"
              required
            />
          </label>

          <label>
            Senha
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="Senha"
              required
            />
          </label>

          <label>
            Confirmar Senha
            <input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              type="password"
              placeholder="Confirme a senha"
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        {error && <div className="alert">{error}</div>}
        {message && <div style={{ marginTop: '1rem', color: '#d1fae5' }}>{message}</div>}
      </div>
    </div>
  );
}