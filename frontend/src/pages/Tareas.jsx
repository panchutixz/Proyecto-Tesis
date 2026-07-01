import '@styles/tareas.css';
import { useState }           from 'react';
import { useAuth }            from '@context/AuthContext.jsx';
import { useTareas }          from '@context/TareasContext.jsx';
import useCreateTarea         from '@hooks/tareas/useCreateTarea.jsx';

const Tareas = () => {
  const { user }                                     = useAuth();
  const { tareas, loading, fetchTareas,
          agregarTareaLocal, toggleSubtarea }        = useTareas();
  const { handleCreateTarea }                        = useCreateTarea(fetchTareas, agregarTareaLocal);
  const [jornada, setJornada]   = useState('Mañana');
  const [expanded, setExpanded] = useState({});

  const isAdmin = ['administrador', 'Administrador'].includes(user?.rol);
  const toggle  = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const filtradas = tareas.filter(t => t.jornada === jornada);

  return (
    <div className="tareas-page">

      <div className="tareas-header">
        <div className="tareas-title-wrap">
          <h2>Mis Tareas del Día</h2>
          <p className="tareas-subtitle">— Jornada {jornada}</p>
        </div>
        <div className="tareas-header-right">
          <div className="jornada-pills">
            {['Mañana','Tarde'].map(j => (
              <button key={j} className={`jornada-pill ${jornada===j?'active':''}`}
                onClick={() => setJornada(j)}>{j}</button>
            ))}
          </div>
          {isAdmin && (
            <button className="tareas-addbtn" onClick={handleCreateTarea}>
              Asignar Tarea
            </button>
          )}
        </div>
      </div>

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
                  <div className="tarea-header" onClick={() => toggle(tarea.id)}>
                    <span className="tarea-chevron">{open ? '▼' : '▶'}</span>
                    <div className="tarea-info">
                      <p className="tarea-nombre">{tarea.nombre}</p>
                      <p className="tarea-meta">
                      📍 {tarea.departamento} &nbsp;|&nbsp; 
                      Jornada {tarea.jornada} &nbsp;|&nbsp;
                      👤 Asignado: {tarea.trabajador} {/* Agregado dinámico */}
                      </p>
                    </div>
                    <span className={`badge-tarea ${real?'realizado':'no-realizado'}`}>
                      {tarea.estado}
                    </span>
                  </div>

                  {open && (
                    <div className="subtareas-list">
                      {(tarea.subtareas||[]).map(sub => {
                        const sr = sub.estado === 'Realizado';
                        return (
                          <div key={sub.id} className="subtarea-item">
                            <div className={`subtarea-bar ${sr?'realizado':'no-realizado'}`}/>
                            <div className={`subtarea-check ${sr?'checked':''}`}
                              onClick={() => toggleSubtarea(tarea.id, sub.id)}
                              title="Marcar como realizado">
                              {sr ? '✓' : ''}
                            </div>
                            <span className={`subtarea-texto ${sr?'realizado':''}`}>{sub.texto}</span>
                            <span className={`subtarea-estado ${sr?'realizado':'no-realizado'}`}>
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