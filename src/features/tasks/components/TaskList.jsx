import React, { useMemo } from 'react';

export function TaskList({ tasks, loading, onSelectTask, onCreateTask, onReload }) {
  const groupedTasks = useMemo(() => {
    const groups = {};
    tasks.forEach((task) => {
      const date = task.solveDay ? new Date(task.solveDay) : new Date();
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });

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

      {loading && <div className="empty-state">Cargando tareas...</div>}

      {!loading && tasks.length === 0 && (
        <div className="empty-state">
          <p>No hay tareas registradas aún.</p>
          <p>Usa el botón "Crear nueva tarea" para comenzar.</p>
        </div>
      )}

      <div className="grouped-task-list">
        {groupedTasks.map((group) => (
          <div key={group.name} className="task-group">
            <div className="task-group-header">
              <span>{group.name}</span>
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
                  <div>
                    <div className="task-title">{task.title || 'Sin título'}</div>
                    <div className="task-meta">
                      <span>{task.status || 'PENDING'}</span>
                      <span>{task.isActive ? 'Activo' : 'Inactivo'}</span>
                      {task.value !== undefined && <span>Valor: {task.value}</span>}
                    </div>
                  </div>
                  <div className="task-actions">
                    {getStatusIcon(task.status)}
                    <span className="task-link">Ver detalle</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
