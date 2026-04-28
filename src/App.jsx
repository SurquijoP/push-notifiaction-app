import { useState } from 'react';
import { useAuth, useUser, SignInButton } from '@clerk/clerk-react';
import { TaskDetail } from './features/tasks/components/TaskDetail.jsx';
import { TaskForm } from './features/tasks/components/TaskForm.jsx';
import { TaskList } from './features/tasks/components/TaskList.jsx';
import { SuggestedTaskView } from './features/tasks/components/SuggestedTaskView.jsx';
import { useTasks } from './features/tasks/useTasks.js';
import './App.css';

function App() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [view, setView] = useState('list');
  const [selectedTask, setSelectedTask] = useState(null);
  const { tasks, loading, message, filters, loadTasks, createTask, updateTask, deleteTask, toggleTaskActive } = useTasks();

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setView('detail');
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setView('create');
  };

  const handleCancel = () => {
    setSelectedTask(null);
    setView('list');
  };

  const shouldShowSuggested =
    isSignedIn &&
    !loading &&
    tasks.length === 0 &&
    view === 'list' &&
    Array.isArray(filters.categories) &&
    filters.categories.length > 0;

  const handleSubmitTask = async (form) => {
    if (selectedTask?.id || selectedTask?._id) {
      await updateTask(selectedTask.id || selectedTask._id, user?.id ?? 'unknown', form);
    } else {
      await createTask(form);
    }
    setView('list');
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('¿Deseas eliminar esta tarea?')) return;
    await deleteTask(taskId);
    handleCancel();
  };

  const handleToggleActive = async (taskId, type) => {
    await toggleTaskActive(taskId, type);
    handleCancel();
  };

  return (
    <div className="task-app">
      <div className="task-card page-shell">
        <div className="task-header">
          <div>
            <h1>Mi panel de tareas</h1>
            <p>Arquitectura limpia con slices verticales: login, lista, creación y detalle.</p>
          </div>
          {isSignedIn ? (
            <button className="primary-button" onClick={handleCreateTask} disabled={loading}>
              Crear nueva tarea
            </button>
          ) : null}
        </div>

        <div className="page-hero">
          <div>
            <h2>{isSignedIn ? `Hola, ${user?.firstName || user?.fullName || 'usuario'}` : 'Bienvenido'}</h2>
            <p>
              {isSignedIn
                ? 'Selecciona una tarea para ver su detalle o crea una nueva desde el botón.'
                : 'Inicia sesión para acceder a tu lista de tareas personales.'}
            </p>
          </div>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="primary-button">Iniciar sesión</button>
            </SignInButton>
          ) : null}
        </div>

        {message && <div className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</div>}

        {!isSignedIn ? (
          <div className="empty-state">
            <p>Para comenzar, inicia sesión con el botón de arriba.</p>
          </div>
        ) : (
          <>
            {shouldShowSuggested && (
              <SuggestedTaskView
                categories={filters.categories || []}
                onSelectSuggested={(category, suggestion) => {
                  setSelectedTask({
                    title: suggestion,
                    category: { id: category.id }
                  });
                  setView('create');
                }}
                onCreateManual={handleCreateTask}
                loading={loading}
              />
            )}

            {!shouldShowSuggested && view === 'list' && (
              <TaskList
                tasks={tasks}
                loading={loading}
                onSelectTask={handleSelectTask}
                onCreateTask={handleCreateTask}
                onReload={loadTasks}
              />
            )}

            {view === 'detail' && selectedTask && (
              <TaskDetail
                task={selectedTask}
                filters={filters}
                onBack={handleCancel}
                onEdit={() => setView('create')}
                onDelete={handleDeleteTask}
                onToggleActive={handleToggleActive}
                loading={loading}
              />
            )}

            {view === 'create' && (
              <TaskForm
                initialTask={selectedTask}
                filters={filters}
                onSubmit={handleSubmitTask}
                onCancel={handleCancel}
                loading={loading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;