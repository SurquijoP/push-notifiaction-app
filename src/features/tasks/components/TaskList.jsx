import React, { useEffect, useMemo, useRef } from 'react';

export function TaskList({
  tasks,
  loading,
  loadingMore,
  hasMore,
  onSelectTask,
  onCreateTask,
  onReload,
  onLoadMore
}) {
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || !onLoadMore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && !loadingMore) {
          onLoadMore();
        }
      },
      { rootMargin: '0px 0px 300px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, onLoadMore]);

  const groupedTasks = useMemo(() => {
    const groups = {};
    tasks.forEach((task) => {
      const date = task.solveDay ? new Date(task.solveDay) : new Date();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      let monthName = date.toLocaleDateString('es-ES', { month: 'long' });
      monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

      if (!groups[monthKey]) {
        groups[monthKey] = { name: monthName, tasks: [] };
      }
      groups[monthKey].tasks.push(task);
    });

    // Ordenar por mes descendente
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((key) => groups[key]);
  }, [tasks]);

  const getStatusIcon = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'solved') {
      return <span className="status-icon solved">✓</span>;
    }
    if (statusLower === 'delayed') {
      return <span className="status-icon delayed">✕</span>;
    }
    if (statusLower === 'pending' || !statusLower) {
      return <span className="status-icon pending">•</span>;
    }
    return null;
  };

  return (
    <div className="task-list-card">
      <div className="task-list-header">
        <div>
          <h2>Lista de tareas</h2>
          <p>Selecciona una tarea para ver el detalle o usa el botón para crear una nueva.</p>
        </div>
        <div className="task-list-actions">
          <button className="primary-button" onClick={onCreateTask} disabled={loading}>
            Crear nueva tarea
          </button>
          <button className="secondary-button" onClick={onReload} disabled={loading}>
            Refrescar
          </button>
        </div>
      </div>

      {loading && tasks.length === 0 && (
        <div className="task-list-skeleton" aria-label="Cargando tareas">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="task-skeleton">
              <div className="skeleton-circle" />
              <div className="task-body">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-meta" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="empty-state">
          <p>No hay tareas registradas aún.</p>
          <p>Usa el botón "Crear nueva tarea" para comenzar.</p>
        </div>
      )}

      <div className="grouped-task-list">
        {groupedTasks.map((group) => (
          <><div className='group-name-date'>
            <h4>{group.name}</h4>
          </div>
          <div key={group.name} className="task-group">
            <div className="task-group-header">
              <span className="task-group-count">{group.tasks.length} tareas</span>
            </div>
            <div className="task-list">
              {group.tasks.map((task) => (
                <button
                  key={task.id || task._id}
                  type="button"
                  className="task-item"
                  onClick={() => onSelectTask(task)}
                >
                  <div className="task-main">
                    <div className="task-icon">{getStatusIcon(task.status)}</div>
                    <div className="task-body">
                      <div className="task-title">{task.title || 'Sin título'}</div>
                      <div className="task-meta">
                        <span>
                          {task.solveDay
                            ? `Compromiso: ${new Date(task.solveDay).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              day: '2-digit',
                              timeZone: 'UTC'
                            })}`
                            : 'Sin fecha de compromiso'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div></>
        ))}
      </div>

      <div ref={loadMoreRef} className="task-list-pagination" aria-live="polite">
        {loadingMore && <span>Cargando más tareas...</span>}
        {!loadingMore && !hasMore && tasks.length > 0 && <span>No hay más tareas.</span>}
      </div>
    </div>
  );
}
