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
    category: 'design',
    tags: '',
    image_url: '',
    link: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      router.push('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['design', 'desenvolvimento', 'marketing', 'fotografia', 'arte', 'outro'];

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.createProject}>
          <div className={styles.formContainer}>
            <h1>📱 Novo Projeto</h1>
            
            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Título *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nome do seu projeto"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descrição *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva seu projeto em detalhes..."
                  rows="6"
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Categoria</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="web, design, react..."
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
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Link do Projeto</label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://seu-projeto.com"
                />
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? 'Publicando...' : '✨ Publicar Projeto'}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => router.back()}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
