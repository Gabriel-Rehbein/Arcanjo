import ScheduleCard from './ScheduleCard';
import styles from '../../styles/pages/calendar.module.css';

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isToday(date) {
  return getDateKey(date) === getDateKey(new Date());
}

export default function CalendarView({
  cells,
  projectsByDate,
  onSelectDate,
  onEdit,
  onDelete,
  onMove,
}) {
  return (
    <>
      <div className={styles.weekDays}>
        {WEEK_DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className={styles.monthGrid}>
        {cells.map((date, index) => {
          const key = date ? getDateKey(date) : `empty-${index}`;
          const projects = date ? projectsByDate[key] || [] : [];

          if (!date) return <div key={key} className={`${styles.dayCell} ${styles.emptyDay}`} />;

          return (
            <button
              key={key}
              type="button"
              className={`${styles.dayCell} ${isToday(date) ? styles.today : ''}`}
              onClick={() => onSelectDate(date)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const projectId = event.dataTransfer.getData('text/plain');
                if (projectId) onMove(projectId, date);
              }}
              aria-label={`Programar publicacao em ${date.toLocaleDateString('pt-BR')}`}
            >
              <span className={styles.dayNumber}>{date.getDate()}</span>
              <div className={styles.daySchedules}>
                {projects.slice(0, 3).map((project) => (
                  <ScheduleCard
                    key={project.id}
                    project={project}
                    compact
                    draggable={project.ui_status !== 'draft'}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
                {projects.length > 3 && <small>+{projects.length - 3} publicacoes</small>}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

export { getDateKey };
