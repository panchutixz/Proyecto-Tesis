import '@styles/tareas.css';
import { useState, useRef }  from 'react';
import { useAuth }           from '@context/AuthContext.jsx';
import { useTareas }         from '@context/TareasContext.jsx';
import useCreateTarea        from '@hooks/tareas/useCreateTarea.jsx';
import { useEditTarea }      from '@hooks/tareas/useEditTarea.jsx';
import { useDeleteTarea }    from '@hooks/tareas/useDeleteTarea.jsx';
import {
  FiChevronDown,
  FiChevronRight,
  FiMapPin,
  FiUser,
  FiCheck,
  FiEdit2,
  FiTrash2,
  FiPaperclip,
  FiImage,
} from 'react-icons/fi';

const BASE_URL = import.meta.env.VITE_BASE_URL || '';

const Tareas = () => {
  const { user }                                    = useAuth();
  const { tareas, loading, fetchTareas,
          agregarTareaLocal, toggleSubtarea,
          subirEvidencia }                          = useTareas();
  const { handleCreateTarea }                       = useCreateTarea(fetchTareas, agregarTareaLocal);
  const { handleEditTarea }                         = useEditTarea(fetchTareas);
  const { handleDeleteTarea }                       = useDeleteTarea(fetchTareas);

  const rol     = user?.rol?.toLowerCase();
  const isAdmin = rol === 'administrador';
  const isEmpleado = !isAdmin;

  const jornadaEmpleado = user?.jornada || 'Mañana';
  const [jornada, setJornada]   = useState(isEmpleado ? jornadaEmpleado : 'Mañana');
  const [expanded, setExpanded] = useState({});
  const [subiendoId, setSubiendoId] = useState(null);
  const fileInputRefs = useRef({});

  const toggle    = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const filtradas = tareas.filter(t => t.jornada === jornada);

  const getImageUrl = (path) => `${BASE_URL.replace('/api', '')}${path}`;

  const handleSeleccionarArchivo = (tareaId) => {
    fileInputRefs.current[tareaId]?.click();
  };

  const handleArchivoElegido = async (tareaId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendoId(tareaId);
    const resultado = await subirEvidencia(tareaId, file);
    setSubiendoId(null);
    e.target.value = '';

    if (!resultado.ok) {
      alert(resultado.message);
    }
  };

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
            <div className="jornada-pills">
              <span className="jornada-pill active">{jornadaEmpleado}</span>
            </div>
          )}

          {isAdmin && (
            <button className="tareas-addbtn" onClick={handleCreateTarea}>
              Asignar Tarea
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

                  <div className="tarea-header" onClick={() => toggle(tarea.id)}>
                    <span className="tarea-chevron">
                      {open ? <FiChevronDown /> : <FiChevronRight />}
                    </span>

                    <div className="tarea-info">
                      <p className="tarea-nombre">{tarea.nombre}</p>
                      <p className="tarea-meta">
                        <FiMapPin className="meta-icon" /> {tarea.departamento} &nbsp;|&nbsp; Jornada {tarea.jornada}
                        {isAdmin && (
                          <> &nbsp;|&nbsp; <FiUser className="meta-icon" /> Asignado: {tarea.trabajador}</>
                        )}
                      </p>
                    </div>

                    <span className={`badge-tarea ${real ? 'realizado' : 'no-realizado'}`}>
                      {tarea.estado}
                    </span>

                    {isAdmin && (
                      <div className="tarea-acciones" onClick={e => e.stopPropagation()}>
                        <button className="btn-tarea-editar"
                          onClick={() => handleEditTarea(tarea)}
                          title="Editar tarea">
                          <FiEdit2 />
                        </button>
                        <button className="btn-tarea-eliminar"
                          onClick={() => handleDeleteTarea(tarea)}
                          title="Eliminar tarea">
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </div>

                  {open && (
                    <div className="subtareas-list">
                      {(tarea.subtareas || []).map(sub => {
                        const sr = sub.estado === 'Realizado';
                        return (
                          <div key={sub.id} className="subtarea-item">
                            <div className={`subtarea-bar ${sr ? 'realizado' : 'no-realizado'}`} />

                            <div
                              className={`subtarea-check ${sr ? 'checked' : ''}`}
                              onClick={() => toggleSubtarea(tarea.id, sub.id)}
                              title="Marcar como realizado"
                            >
                              {sr && <FiCheck />}
                            </div>

                            <span className={`subtarea-texto ${sr ? 'realizado' : ''}`}>
                              {sub.texto}
                            </span>
                            <span className={`subtarea-estado ${sr ? 'realizado' : 'no-realizado'}`}>
                              {sr && <FiCheck className="estado-icon" />} {sr ? 'Realizado' : 'No Realizado'}
                            </span>
                          </div>
                        );
                      })}

                      {/* Evidencia — solo cuando la TAREA completa está Realizada */}
                      {real && (
                        <div className="evidencia-section">
                          {tarea.evidenciaUrl ? (
                            <div className="evidencia-lista">
                              <FiImage className="evidencia-icon-check" />
                              <span>Evidencia adjuntada</span>
                              <a
                                href={getImageUrl(tarea.evidenciaUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="evidencia-ver"
                              >
                                Ver imagen
                              </a>
                              <button
                                className="btn-evidencia-cambiar"
                                onClick={() => handleSeleccionarArchivo(tarea.id)}
                                disabled={subiendoId === tarea.id}
                              >
                                {subiendoId === tarea.id ? 'Subiendo...' : 'Cambiar foto'}
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn-evidencia"
                              onClick={() => handleSeleccionarArchivo(tarea.id)}
                              disabled={subiendoId === tarea.id}
                            >
                              <FiPaperclip className="evidencia-icon" />
                              {subiendoId === tarea.id ? 'Subiendo...' : 'Dejar evidencia (opcional)'}
                            </button>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            ref={el => fileInputRefs.current[tarea.id] = el}
                            onChange={(e) => handleArchivoElegido(tarea.id, e)}
                            style={{ display: 'none' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="tareas-hint">
            <FiChevronDown className="hint-icon" /> Presiona una tarea para ver subtareas
          </p>
        </>
      )}
    </div>
  );
};

export default Tareas;