const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const taskAdminUrl = import.meta.env.VITE_API_ADMIN_URL || baseApiUrl;

const handleResponse = async (response) => {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || `Error ${response.status}: ${response.statusText}`);
  }
  return body;
};

const cleanPayload = (form) => {
  const payload = {
    title: form.title?.trim(),
    status: form.status,
    isActive: form.isActive,
    wallet: form.walletId || form.walletName ? [{ id: form.walletId, name: form.walletName }] : undefined,
    category: form.categoryId ? { id: form.categoryId } : undefined,
    value: form.value ? Number(form.value) : undefined,
    solveDay: form.solveDay || undefined,
    frequency: form.frequencyId ? { id: form.frequencyId } : undefined,
    extraFields: Array.isArray(form.extraFields)
      ? form.extraFields
          .filter((item) => item?.label && item?.value)
          .map((item) => ({ label: item.label, value: item.value }))
      : form.extraLabel || form.extraValue
      ? [{ label: form.extraLabel, value: form.extraValue }]
      : [],
    entity:
      form.createEntity || form.entityId
        ? form.createEntity
          ? {
              name: form.entityName,
              commercialName: form.entityCommercialName,
              nit: form.entityNit,
              isBilling: form.entityIsBilling,
              link: form.entityLink || '',
              btnRedirect: form.entityBtnRedirect || null,
              isNew: form.entityIsNew
            }
          : { id: form.entityId }
        : undefined
  };

  Object.keys(payload).forEach((key) => {
    const value = payload[key];
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete payload[key];
    }
  });

  return payload;
};

export const taskApi = {
  getTasks: async (headers) => {
    const response = await fetch(`${baseApiUrl}/api-coremanagment/tasks`, {
      method: 'GET',
      headers
    });
    const body = await handleResponse(response);
    return Array.isArray(body.data) ? body.data : [];
  },

  getCreateFilters: async (headers) => {
    const response = await fetch(`${baseApiUrl}/api-coremanagment/tasks/create/filters`, {
      method: 'GET',
      headers
    });
    const body = await handleResponse(response);
    return body.data || { categories: [], wallets: [], entities: [], frequencies: [] };
  },

  createTask: async (form, headers) => {
    const payload = cleanPayload(form);
    const response = await fetch(`${baseApiUrl}/api-coremanagment/tasks/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const body = await handleResponse(response);
    return body.data || body;
  },

  updateTask: async (taskId, userId, form, headers) => {
    const payload = cleanPayload(form);
    const response = await fetch(`${taskAdminUrl}/api-coremanagment/tasks/update/${taskId}/user/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    });
    const body = await handleResponse(response);
    return body.data || body;
  },

  deleteTask: async (taskId, headers) => {
    const response = await fetch(`${taskAdminUrl}/api-coremanagment/tasks/${taskId}`, {
      method: 'DELETE',
      headers
    });
    await handleResponse(response);
    return taskId;
  },

  toggleTaskActive: async (taskId, type, headers) => {
    const response = await fetch(`${taskAdminUrl}/api-coremanagment/tasks/${taskId}/${type}`, {
      method: 'PATCH',
      headers
    });
    await handleResponse(response);
    return taskId;
  }
};
