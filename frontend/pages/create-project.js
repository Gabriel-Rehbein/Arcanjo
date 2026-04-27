import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from '../styles/pages/createProject.module.css';
import { apiFetch } from '../utils/api';

export default function CreateProject() {

  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'desenvolvimento',
    tags: '',
    image_url: '',
    link: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'design',
    'desenvolvimento',
    'marketing',
    'fotografia',
    'arte',
    'outro',
  ];

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function validateForm() {
    if (formData.title.trim().length < 3) {
      return 'O título precisa ter pelo menos 3 caracteres.';
    }

    if (formData.description.trim().length < 10) {
      return 'A descrição precisa ter pelo menos 10 caracteres.';
    }

    if (formData.image_url && !formData.image_url.startsWith('http')) {
      return 'A URL da imagem precisa começar com http ou https.';
    }

    if (formData.link && !formData.link.startsWith('http')) {
      return 'O link do projeto precisa começar com http ou https.';
    }

    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      router.push('/feed');
    } catch (err) {
      setError(err.message || 'Erro ao publicar projeto.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.createProject}>
          <div className={styles.formContainer}>
            <h1>Novo Projeto</h1>
            <p>Publique um projeto para aparecer no feed da rede social.</p>

            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Título *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Sistema de Portfólio"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descrição *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Explique o objetivo, tecnologias e funcionalidades..."
                  rows="6"
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Categoria</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="react, node, mysql"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>URL da Imagem</label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://site.com/imagem.png"
                />
              </div>

              {formData.image_url && (
                <div className={styles.preview}>
                  <img src={formData.image_url} alt="Prévia do projeto" />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Link do Projeto</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://github.com/seu-projeto"
                />
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Publicando...' : 'Publicar Projeto'}
                </button>

                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}