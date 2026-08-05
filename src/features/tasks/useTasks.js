import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { taskApi } from './taskApi';

export const useTasks = () => {
  const TASKS_PAGE_SIZE = 20;
  const { getToken, isSignedIn } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({ categories: [], wallets: [], entities: [], frequencies: [] });
  const [message, setMessage] = useState('');
  const tasksRef = useRef([]);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  const updateTasks = useCallback((nextTasks) => {
    tasksRef.current = nextTasks;
    setTasks(nextTasks);
  }, []);

  const updateHasMore = useCallback((nextHasMore) => {
    hasMoreRef.current = nextHasMore;
    setHasMore(nextHasMore);
  }, []);

  const mergeTasks = useCallback((currentTasks, nextTasks) => {
    const knownIds = new Set(
      currentTasks
        .map((task) => task.id || task._id)
        .filter(Boolean)
    );
    const newTasks = nextTasks.filter((task) => {
      const taskId = task.id || task._id;
      if (!taskId) return true;
      if (knownIds.has(taskId)) return false;
      knownIds.add(taskId);
      return true;
    });

    return [...currentTasks, ...newTasks];
  }, []);

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
      updateTasks([]);
      pageRef.current = 0;
      updateHasMore(false);
      setMessage('');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const headers = await getHeaders();
      const result = await taskApi.getTasks(headers, { page: 1, limit: TASKS_PAGE_SIZE });
      updateTasks(result.tasks);
      pageRef.current = 1;
      updateHasMore(result.hasMore);
    } catch (error) {
      handleError(error, 'No se pudieron cargar las tareas');
      updateTasks([]);
      pageRef.current = 0;
      updateHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [getHeaders, handleError, isSignedIn, updateHasMore, updateTasks]);

  const loadMoreTasks = useCallback(async () => {
    if (!isSignedIn || loadingMoreRef.current || !hasMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoading(true);

    const nextPage = pageRef.current + 1;

    try {
      const headers = await getHeaders();
      const result = await taskApi.getTasks(headers, { page: nextPage, limit: TASKS_PAGE_SIZE });
      const currentTasks = tasksRef.current;
      const mergedTasks = mergeTasks(currentTasks, result.tasks);
      const receivedNewTasks = mergedTasks.length > currentTasks.length;

      updateTasks(mergedTasks);
      pageRef.current = nextPage;
      updateHasMore(result.hasMore && receivedNewTasks);
    } catch (error) {
      handleError(error, 'No se pudieron cargar más tareas');
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
      setLoading(false);
    }
  }, [getHeaders, handleError, isSignedIn, mergeTasks, updateHasMore, updateTasks]);

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
      updateTasks(tasksRef.current.filter((task) => task.id !== taskId && task._id !== taskId));
      setMessage('✅ Tarea eliminada correctamente');
      } catch (error) {
        handleError(error, 'No se pudo eliminar la tarea');
      } finally {
        setLoading(false);
      }
    },
    [getHeaders, handleError, updateTasks]
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
      updateTasks([]);
      pageRef.current = 0;
      updateHasMore(false);
      setFilters({ categories: [], wallets: [], entities: [], frequencies: [] });
      setMessage('');
      return;
    }

    loadTasks();
    loadFilters();
  }, [isSignedIn, loadTasks, loadFilters, updateHasMore, updateTasks]);

  return {
    tasks,
    loading,
    message,
    filters,
    hasMore,
    loadingMore,
    loadTasks,
    loadMoreTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskActive
  };
};
