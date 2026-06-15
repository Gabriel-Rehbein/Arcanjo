import { useEffect } from 'react';
import { PUBLICATION_TYPES } from '../../utils/publicationTypes';
import styles from '../../styles/pages/calendar.module.css';

const CATEGORIES = ['design', 'desenvolvimento', 'marketing', 'fotografia', 'arte', 'outro'];

export default function ScheduleModal({
  open,
  mode,
  formData,
  error,
  saving,
  onChange,
  onClose,
  onSubmit,
  onSaveDraft,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function closeOnEscape(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-title"
      >
        <header className={styles.modalHeader}>
          <div>
            <span>{mode === 'edit' ? 'Editar agendamento' : 'Nova publicacao'}</span>
            <h2 id="schedule-title">
              {mode === 'edit' ? formData.title || 'Publicacao' : 'Programar publicacao'}
            </h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar"
          >
            x
          </button>
        </header>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.formRow}>
            <label>
              <span>Data e horario</span>
              <input
                type="datetime-local"
                name="scheduled_at"
                value={formData.scheduled_at}
                onChange={onChange}
                required
              />
            </label>
            <label>
              <span>Tipo</span>
              <select name="post_type" value={formData.post_type} onChange={onChange}>
                {PUBLICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>Titulo</span>
            <input
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="Ex: Lancamento do portfolio"
              required
            />
          </label>

          <label>
            <span>Descricao</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              rows="4"
              placeholder="Conte a historia do projeto..."
              required
            />
          </label>

          <div className={styles.formRow}>
            <label>
              <span>Categoria</span>
              <select name="category" value={formData.category} onChange={onChange}>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Tags</span>
              <input
                name="tags"
                value={formData.tags}
                onChange={onChange}
                placeholder="react, design"
              />
            </label>
          </div>

          <label>
            <span>URL da imagem</span>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={onChange}
              placeholder="https://..."
            />
          </label>

          <label>
            <span>Link do projeto</span>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={onChange}
              placeholder="https://..."
            />
          </label>

          <footer className={styles.modalActions}>
            <button type="button" className={styles.secondaryButton} onClick={onSaveDraft}>
              Salvar rascunho
            </button>
            <button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : mode === 'edit' ? 'Salvar alteracoes' : 'Programar'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
