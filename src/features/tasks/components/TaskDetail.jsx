import React from 'react';

export function TaskDetail({ task, filters, onBack, onEdit, onDelete, onToggleActive, loading }) {
  const getCategoryName = (categoryId) => {
    const category = filters.categories?.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getEntityName = (entityId) => {
    const entity = filters.entities?.find(ent => ent.id === entityId);
    return entity ? entity.name : entityId;
  };

  return (
    <div className="task-list-card">
      <div className="task-list-header">
        <div>
          <h2>Detalle de tarea</h2>
          <p>Revisa la información completa y edita la tarea si lo necesitas.</p>
        </div>
        <div className="task-list-actions">
          <button className="secondary-button" onClick={onBack} disabled={loading}>
            Volver a la lista
          </button>
          <button className="primary-button" onClick={onEdit} disabled={loading}>
            Editar tarea
          </button>
        </div>
      </div>

      <div className="task-detail-card">
        <div className="detail-row">
          <strong>Título</strong>
          <span>{task.title || 'Sin título'}</span>
        </div>
        <div className="detail-row">
          <strong>Estado</strong>
          <span>{task.status || 'PENDING'}</span>
        </div>
        <div className="detail-row">
          <strong>Activo</strong>
          <span>{task.isActive ? 'Sí' : 'No'}</span>
        </div>
        {task.value !== undefined && (
          <div className="detail-row">
            <strong>Valor</strong>
            <span>{task.value}</span>
          </div>
        )}
        {task.solveDay && (
          <div className="detail-row">
            <strong>Fecha de resolución</strong>
            <span>{task.solveDay.slice(0, 10)}</span>
          </div>
        )}
        {task.category?.id && (
          <div className="detail-row">
            <strong>Categoría</strong>
            <span>{getCategoryName(task.category.id)}</span>
          </div>
        )}
        {task.entity?.id && (
          <div className="detail-row">
            <strong>Entidad</strong>
            <span>{getEntityName(task.entity.id)}</span>
          </div>
        )}
        {task.wallet?.[0]?.name && (
          <div className="detail-row">
            <strong>Wallet</strong>
            <span>{task.wallet[0].name}</span>
          </div>
        )}
        <div className="detail-actions">
          {(task.status || '').toString().toLowerCase() === 'pending' && (
            <button
              className="primary-button"
              onClick={() => onToggleActive(task.id || task._id, 'status')}
              disabled={loading}
            >
              Completar
            </button>
          )}
          {(task.status || '').toString().toLowerCase() === 'solved' && (
            <button
              className="secondary-button"
              onClick={() => onToggleActive(task.id || task._id, 'status')}
              disabled={loading}
            >
              Volver a pendiente
            </button>
          )}
          <button
            className={task.isActive ? 'secondary-button' : 'primary-button'}
            onClick={() => onToggleActive(task.id || task._id, task.isActive ? 'inactive' : 'active')}
            disabled={loading}
          >
            {task.isActive ? 'Desactivar' : 'Activar'}
          </button>
          <button className="danger-button" onClick={() => onDelete(task.id || task._id)} disabled={loading}>
            Eliminar tarea
          </button>
        </div>
      </div>
    </div>
  );
}
