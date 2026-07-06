import '@styles/tareas.css';
import { useState }          from 'react';
import { useAuth }           from '@context/AuthContext.jsx';
import { useTareas }         from '@context/TareasContext.jsx';
import useCreateTarea        from '@hooks/tareas/useCreateTarea.jsx';
import { useEditTarea }      from '@hooks/tareas/useEditTarea.jsx';
import { useDeleteTarea }    from '@hooks/tareas/useDeleteTarea.jsx';

const Tareas = () => {
  const { user }                                    = useAuth();
  const { tareas, loading, fetchTareas,
          agregarTareaLocal, toggleSubtarea }       = useTareas();
  const { handleCreateTarea }                       = useCreateTarea(fetchTareas, agregarTareaLocal);
  const { handleEditTarea }                         = useEditTarea(fetchTareas);
  const { handleDeleteTarea }                       = useDeleteTarea(fetchTareas);

  const rol        = user?.rol?.toLowerCase();
  const isAdmin    = rol === 'administrador';
  const isEmpleado = !isAdmin;

  // Empleado: usa su jornada del token; Admin: puede cambiar
  const jornadaEmpleado = user?.jornada || 'Mañana';
  const [jornada, setJornada]   = useState(isEmpleado ? jornadaEmpleado : 'Mañana');
  const [expanded, setExpanded] = useState({});

  const toggle    = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const filtradas = tareas.filter(t => t.jornada === jornada);

  return (
    <div className="tareas-page">

      {/* ── Header ── */}
      <div className="tareas-header">
        <div className="tareas-title-wrap">
          <h2>{isAdmin ? 'Gestión de Tareas' : 'Mis Tareas del Día'}</h2>
          <p className="tareas-subtitle">— Jornada {jornada}</p>
        </div>

        <div className="tareas-header-right">
          {isAdmin ? (
            // Admin puede cambiar entre jornadas
            <div className="jornada-pills">
              {['Mañana', 'Tarde'].map(j => (
                <button key={j}
                  className={`jornada-pill ${jornada === j ? 'active' : ''}`}
                  onClick={() => setJornada(j)}>
                  {j}
                </button>
              ))}
            </div>
          ) : (
            // Empleado: solo muestra su jornada, no es clickeable
            <div className="jornada-pills">
              <span className="jornada-pill active">{jornadaEmpleado}</span>
            </div>
          )}

          {isAdmin && (
            <button className="tareas-addbtn" onClick={handleCreateTarea}>
              + Asignar Tarea
            </button>
          )}
        </div>
      </div>

      {/* ── Lista ── */}
      {loading ? (
        <p className="tareas-empty">Cargando tareas...</p>
      ) : filtradas.length === 0 ? (
        <p className="tareas-empty">No hay tareas para la jornada {jornada}.</p>
      ) : (
        <>
          <div className="tareas-list">
            {filtradas.map(tarea => {
              const open = !!expanded[tarea.id];
              const real = tarea.estado === 'Realizado';

              return (
                <div key={tarea.id} className="tarea-card">

                  {/* Header clickeable */}
                  <div className="tarea-header" onClick={() => toggle(tarea.id)}>
                    <span className="tarea-chevron">{open ? '▼' : '▶'}</span>

                    <div className="tarea-info">
                      <p className="tarea-nombre">{tarea.nombre}</p>
                      <p className="tarea-meta">
                        📍 {tarea.departamento} &nbsp;|&nbsp; Jornada {tarea.jornada}
                        {isAdmin && (
                          <> &nbsp;|&nbsp; 👤 Asignado: {tarea.trabajador}</>
                        )}
                      </p>
                    </div>

                    <span className={`badge-tarea ${real ? 'realizado' : 'no-realizado'}`}>
                      {tarea.estado}
                    </span>

                    {/* Botones editar/eliminar solo admin */}
                    {isAdmin && (
                      <div className="tarea-acciones" onClick={e => e.stopPropagation()}>
                        <button className="btn-tarea-editar"
                          onClick={() => handleEditTarea(tarea)}
                          title="Editar tarea">✏️
                        </button>
                        <button className="btn-tarea-eliminar"
                          onClick={() => handleDeleteTarea(tarea)}
                          title="Eliminar tarea">🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subtareas expandidas */}
                  {open && (
                    <div className="subtareas-list">
                      {(tarea.subtareas || []).map(sub => {
                        const sr = sub.estado === 'Realizado';
                        return (
                          <div key={sub.id} className="subtarea-item">
                            <div className={`subtarea-bar ${sr ? 'realizado' : 'no-realizado'}`} />

                            {/* Check: solo empleado puede marcar */}
                            <div
                              className={`subtarea-check ${sr ? 'checked' : ''} ${isAdmin ? 'readonly' : ''}`}
                              onClick={() => { if (isEmpleado) toggleSubtarea(tarea.id, sub.id); }}
                              title={isAdmin ? 'Solo el empleado puede marcar subtareas' : 'Marcar como realizado'}
                            >
                              {sr ? '✓' : ''}
                            </div>

                            <span className={`subtarea-texto ${sr ? 'realizado' : ''}`}>
                              {sub.texto}
                            </span>
                            <span className={`subtarea-estado ${sr ? 'realizado' : 'no-realizado'}`}>
                              {sr ? '✓ Realizado' : 'No Realizado'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="tareas-hint">▼ Presiona una tarea para ver subtareas</p>
        </>
      )}
    </div>
  );
};

export default Tareas;