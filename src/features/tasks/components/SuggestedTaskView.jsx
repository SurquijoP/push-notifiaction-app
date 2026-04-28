import React from 'react';

export function SuggestedTaskView({ categories, onSelectSuggested, onCreateManual, loading }) {
  return (
    <div className="task-list-card">
      <div className="task-list-header">
        <div>
          <h2>Crear tu primera tarea</h2>
          <p>Elige una categoría y una sugerencia para iniciar con un recordatorio rápido.</p>
        </div>
        <div className="task-list-actions">
          <button className="secondary-button" onClick={onCreateManual} disabled={loading}>
            Crear tarea manualmente
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          No hay sugerencias disponibles en este momento.
        </div>
      ) : (
        <div className="suggested-categories">
          {categories.map((category) => {
            const suggestions = category.suggestedTask || category.suggestedTasks || [];
            if (!suggestions.length) {
              return null;
            }

            return (
              <div key={category.id} className="suggested-category-card">
                <div className="suggested-category-header">
                  <span>{category.name}</span>
                  <span className="suggested-category-count">{suggestions.length} sugerencias</span>
                </div>
                <div className="suggested-list">
                  {suggestions.map((suggestion) => (
                    <button
                      key={`${category.id}-${suggestion}`}
                      type="button"
                      className="suggested-item"
                      onClick={() => onSelectSuggested(category, suggestion)}
                      disabled={loading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
