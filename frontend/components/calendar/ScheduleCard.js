import styles from '../../styles/pages/calendar.module.css';

const STATUS_LABELS = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  failed: 'Falhou',
};

export default function ScheduleCard({
  project,
  compact = false,
  onEdit,
  onDelete,
  draggable = false,
}) {
  const status = project.ui_status || project.status || 'scheduled';
  const time = project.scheduled_at
    ? new Date(project.scheduled_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  function handleDragStart(event) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(project.id));
  }

  return (
    <article
      className={`${styles.scheduleCard} ${styles[status]} ${compact ? styles.compactCard : ''}`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={(event) => {
        event.stopPropagation();
        onEdit(project);
      }}
      title={`${project.title} - ${STATUS_LABELS[status] || status}`}
    >
      <span className={styles.cardTime}>{time}</span>
      <strong>{project.title || 'Sem titulo'}</strong>
      {!compact && <p>{project.description || 'Sem descricao.'}</p>}
      {!compact && (
        <footer>
          <span>{STATUS_LABELS[status] || status}</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(project);
            }}
            aria-label={`Excluir ${project.title}`}
          >
            Excluir
          </button>
        </footer>
      )}
    </article>
  );
}
