import React, { useMemo, useState } from 'react';

const initialForm = {
  title: '',
  walletId: '',
  walletName: '',
  categoryId: '',
  value: '',
  solveDay: '',
  frequencyId: '',
  extraFields: [],
  createEntity: false,
  entityId: '',
  entityName: '',
  entityCommercialName: '',
  entityNit: '',
  entityLink: '',
  entityBtnRedirect: '',
  entityIsBilling: true,
  entityIsNew: true,
  status: 'PENDING',
  isActive: true
};

const mapInitialTask = (task) => {
  if (!task) {
    return {};
  }

  return {
    title: task.title || '',
    walletId: task.wallet?.[0]?.id || '',
    walletName: task.wallet?.[0]?.name || '',
    categoryId: task.category?.id || '',
    value: task.value?.toString() || '',
    solveDay: task.solveDay?.slice(0, 10) || '',
    frequencyId: task.frequency?.id || '',
    extraFields: Array.isArray(task.extraFields)
      ? task.extraFields.map((item) => ({
          label: item.label || '',
          value: item.value || ''
        }))
      : [],
    createEntity: false,
    entityId: task.entity?.id || '',
    entityName: task.entity?.name || '',
    entityCommercialName: task.entity?.commercialName || '',
    entityNit: task.entity?.nit || '',
    entityLink: task.entity?.link || '',
    entityBtnRedirect: task.entity?.btnRedirect || '',
    entityIsBilling: task.entity?.isBilling ?? true,
    entityIsNew: task.entity?.isNew ?? true,
    status: task.status || 'PENDING',
    isActive: task.isActive ?? true
  };
};

export function TaskForm({ initialTask, filters = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ ...initialForm, ...mapInitialTask(initialTask) });
  const [searchCategory, setSearchCategory] = useState('');
  const [searchWallet, setSearchWallet] = useState('');
  const [searchEntity, setSearchEntity] = useState('');
  const [searchFrequency, setSearchFrequency] = useState('');
  const isEdit = Boolean(initialTask?.id || initialTask?._id);

  const categories = Array.isArray(filters.categories) ? filters.categories : [];
  const wallets = Array.isArray(filters.wallets) ? filters.wallets : [];
  const entities = Array.isArray(filters.entities) ? filters.entities : [];
  const frequencies = Array.isArray(filters.frequencies) ? filters.frequencies : [];

  const filteredCategories = useMemo(
    () => categories.filter((item) => item.name.toLowerCase().includes(searchCategory.toLowerCase())),
    [categories, searchCategory]
  );

  const filteredWallets = useMemo(
    () => wallets.filter((item) => item.name.toLowerCase().includes(searchWallet.toLowerCase())),
    [wallets, searchWallet]
  );

  const filteredEntities = useMemo(
    () => entities.filter((item) => item.name.toLowerCase().includes(searchEntity.toLowerCase())),
    [entities, searchEntity]
  );

  const filteredFrequencies = useMemo(
    () => frequencies.filter((item) => item.code.toLowerCase().includes(searchFrequency.toLowerCase())),
    [frequencies, searchFrequency]
  );

  const formTitle = useMemo(
    () => (isEdit ? 'Editar tarea' : 'Crear nueva tarea'),
    [isEdit]
  );

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleWalletChange = (walletId) => {
    const selected = wallets.find((item) => item.id === walletId);
    setForm((prev) => ({
      ...prev,
      walletId,
      walletName: selected?.name || prev.walletName
    }));
  };

  const handleEntityChange = (entityId) => {
    const selected = entities.find((item) => item.id === entityId);
    const suggested = selected?.suggested_extra_fields || selected?.suggestedExtraFields || [];

    setForm((prev) => ({
      ...prev,
      entityId,
      extraFields: Array.isArray(suggested)
        ? suggested.map((field) => ({
            label: field.name || '',
            value: ''
          }))
        : []
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="task-list-card">
      <div className="task-list-header">
        <div>
          <h2>{formTitle}</h2>
          <p>Completa los datos para guardar la tarea. Selecciona por nombre y se enviará el ID.</p>
        </div>
      </div>

      <form className="task-form" onSubmit={submit}>
        <div className="form-section">
          <label>Título</label>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setField('title', event.target.value)}
            required
            placeholder="Ej: Revisar reporte semanal"
          />
        </div>

        <div className="form-grid">
          <div className="form-section">
            <label>Buscar categoría</label>
            <input
              type="text"
              value={searchCategory}
              onChange={(event) => setSearchCategory(event.target.value)}
              placeholder="Escribe para filtrar categorías"
            />
            <select value={form.categoryId} onChange={(event) => setField('categoryId', event.target.value)}>
              <option value="">Selecciona categoría</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label>Buscar billetera</label>
            <input
              type="text"
              value={searchWallet}
              onChange={(event) => setSearchWallet(event.target.value)}
              placeholder="Escribe para filtrar billeteras"
            />
            <select value={form.walletId} onChange={(event) => handleWalletChange(event.target.value)}>
              <option value="">Selecciona billetera</option>
              {filteredWallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-section">
            <label>Buscar frecuencia</label>
            <input
              type="text"
              value={searchFrequency}
              onChange={(event) => setSearchFrequency(event.target.value)}
              placeholder="Escribe para filtrar frecuencias"
            />
            <select value={form.frequencyId} onChange={(event) => setField('frequencyId', event.target.value)}>
              <option value="">Selecciona frecuencia</option>
              {filteredFrequencies.map((frequency) => (
                <option key={frequency.id} value={frequency.id}>
                  {frequency.code}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label>Valor</label>
            <input
              type="number"
              value={form.value}
              onChange={(event) => setField('value', event.target.value)}
              placeholder="Ej: 10"
            />
          </div>
        </div>

        <div className="toggle-row">
          <label>
            <input
              type="checkbox"
              checked={form.createEntity}
              onChange={(event) => setField('createEntity', event.target.checked)}
            />
            Crear nueva entidad
          </label>
        </div>

        {form.createEntity ? (
          <div className="entity-fields">
            <div className="form-grid">
              <div className="form-section">
                <label>Nombre de entidad</label>
                <input
                  type="text"
                  value={form.entityName}
                  onChange={(event) => setField('entityName', event.target.value)}
                  placeholder="Ej: AIRE-E"
                />
              </div>
              <div className="form-section">
                <label>Nombre comercial</label>
                <input
                  type="text"
                  value={form.entityCommercialName}
                  onChange={(event) => setField('entityCommercialName', event.target.value)}
                  placeholder="Ej: Aire Electricidad"
                />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-section">
                <label>NIT</label>
                <input
                  type="text"
                  value={form.entityNit}
                  onChange={(event) => setField('entityNit', event.target.value)}
                  placeholder="Ej: 900123456"
                />
              </div>
              <div className="form-section">
                <label>Link</label>
                <input
                  type="url"
                  value={form.entityLink}
                  onChange={(event) => setField('entityLink', event.target.value)}
                  placeholder="https://ejemplo.com"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="form-section">
            <label>Buscar entidad</label>
            <input
              type="text"
              value={searchEntity}
              onChange={(event) => setSearchEntity(event.target.value)}
              placeholder="Escribe para filtrar entidades"
            />
            <select value={form.entityId} onChange={(event) => handleEntityChange(event.target.value)}>
              <option value="">Selecciona entidad</option>
              {filteredEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {Array.isArray(form.extraFields) && form.extraFields.length > 0 && (
          <div className="entity-fields">
            <h3>Datos Extras</h3>
            {form.extraFields.map((field, index) => (
              <div key={`${field.label}-${index}`} className="form-grid">
                <div className="form-section">
                  <label>{field.label || 'Dato extra'}</label>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(event) => {
                      const value = event.target.value;
                      setForm((prev) => ({
                        ...prev,
                        extraFields: prev.extraFields.map((item, idx) =>
                          idx === index ? { ...item, value } : item
                        )
                      }));
                    }}
                    placeholder={field.example ? `Ej: ${field.example}` : 'Ingresa el valor' }
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="form-grid">
          <div className="form-section">
            <label>Fecha de resolución</label>
            <input
              type="date"
              value={form.solveDay}
              onChange={(event) => setField('solveDay', event.target.value)}
            />
          </div>
        </div>

        <div className="toggle-row">
          <label>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setField('isActive', event.target.checked)}
            />
            Activar tarea
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={loading}>
            {isEdit ? 'Guardar cambios' : 'Crear tarea'}
          </button>
          <button type="button" className="secondary-button" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
