import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { taskApi } from './taskApi';

export const useTasks = () => {
  const { getToken, isSignedIn } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ categories: [], wallets: [], entities: [], frequencies: [] });
  const [message, setMessage] = useState('');

  const getHeaders = useCallback(
    async (extra = {}) => {
      const headers = { 'Content-Type': 'application/json', ...extra };
      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }
      return headers;
    },
    [getToken, isSignedIn]
  );

  const handleError = useCallback((error, fallback) => {
    console.error(error);
    setMessage(`❌ ${fallback}: ${error.message}`);
    setLoading(false);
  }, []);

  const loadFilters = useCallback(async () => {
    try {
      const headers = await getHeaders();
      const data = await taskApi.getCreateFilters(headers);
      setFilters({
        categories: Array.isArray(data.categories) ? data.categories : [],
        wallets: Array.isArray(data.wallets) ? data.wallets : [],
        entities: Array.isArray(data.entities) ? data.entities : [],
        frequencies: Array.isArray(data.frequencies) ? data.frequencies : []
      });
    } catch (error) {
      console.error('No se pudieron cargar los filtros de tareas:', error);
      setFilters({ categories: [], wallets: [], entities: [], frequencies: [] });
    }
  }, [getHeaders]);

  const loadTasks = useCallback(async () => {
    if (!isSignedIn) {
      setTasks([]);
      setMessage('');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const headers = await getHeaders();
      const data = await taskApi.getTasks(headers);
      setTasks(data);
      setMessage('✅ Tareas cargadas correctamente');
    } catch (error) {
      handleError(error, 'No se pudieron cargar las tareas');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [getHeaders, handleError, isSignedIn]);

  const createTask = useCallback(
    async (form) => {
      setLoading(true);
      setMessage('');

      try {
        const headers = await getHeaders();
        await taskApi.createTask(form, headers);
        setMessage('✅ Tarea creada correctamente');
        await loadTasks();
      } catch (error) {
        handleError(error, 'No se pudo crear la tarea');
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, handleError, loadTasks]
  );

  const updateTask = useCallback(
    async (taskId, userId, form) => {
      setLoading(true);
      setMessage('');

      try {
        const headers = await getHeaders();
        await taskApi.updateTask(taskId, userId, form, headers);
        setMessage('✅ Tarea actualizada correctamente');
        await loadTasks();
      } catch (error) {
        handleError(error, 'No se pudo actualizar la tarea');
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, handleError, loadTasks]
  );

  const deleteTask = useCallback(
    async (taskId) => {
      setLoading(true);
      setMessage('');

      try {
        const headers = await getHeaders();
        await taskApi.deleteTask(taskId, headers);
        setTasks((prev) => prev.filter((task) => task.id !== taskId && task._id !== taskId));
        setMessage('✅ Tarea eliminada correctamente');
      } catch (error) {
        handleError(error, 'No se pudo eliminar la tarea');
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, handleError]
  );

  const toggleTaskActive = useCallback(
    async (taskId, type) => {
      setLoading(true);
      setMessage('');

      try {
        const headers = await getHeaders();
        await taskApi.toggleTaskActive(taskId, type, headers);
        setMessage(`✅ Tarea ${type === 'active' ? 'activada/desactivada' : 'actualizada'} correctamente`);
        await loadTasks();
      } catch (error) {
        handleError(error, `No se pudo actualizar ${type}`);
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, handleError, loadTasks]
  );

  useEffect(() => {
    if (!isSignedIn) {
      setTasks([]);
      setFilters({ categories: [], wallets: [], entities: [], frequencies: [] });
      setMessage('');
      return;
    }

    loadTasks();
    loadFilters();
  }, [isSignedIn, loadTasks, loadFilters]);

  return {
    tasks,
    loading,
    message,
    filters,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskActive
  };
};
