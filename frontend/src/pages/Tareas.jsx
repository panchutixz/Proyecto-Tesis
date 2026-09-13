import '@styles/tareas.css';
import { useState, useRef }  from 'react';
import Swal from 'sweetalert2';
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
  FiX,
} from 'react-icons/fi';

const BASE_URL   = import.meta.env.VITE_BASE_URL || '';
const MAX_FOTOS  = 4;

const Tareas = () => {
  const { user }                                    = useAuth();
    const { tareas, loading, fetchTareas,
          agregarTareaLocal, toggleSubtarea,
          subirEvidenciaSubtarea, eliminarEvidenciaSubtarea } = useTareas();
  const { handleCreateTarea }                       = useCreateTarea(fetchTareas, agregarTareaLocal);
  const { handleEditTarea }                         = useEditTarea(fetchTareas);
  const { handleDeleteTarea }                       = useDeleteTarea(fetchTareas);

  const rol     = user?.rol?.toLowerCase();
  const isAdmin = rol === 'administrador';
  const isEmpleado = !isAdmin;

  const jornadaEmpleado = user?.jornada || 'Mañana';
  const [jornada, setJornada]   = useState(isEmpleado ? jornadaEmpleado : 'Mañana');
  const [expanded, setExpanded] = useState({});
  const [subiendoKey, setSubiendoKey] = useState(null); // `${tareaId}-${subtareaId}`
  const fileInputRefs = useRef({});

  const toggle    = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const filtradas = tareas.filter(t => t.jornada === jornada);

  const getImageUrl = (path) => `${BASE_URL.replace('/api', '')}${path}`;

  const handleSeleccionarArchivo = (tareaId, subtareaId) => {
    fileInputRefs.current[`${tareaId}-${subtareaId}`]?.click();
  };

  const handleArchivosElegidos = async (tareaId, subtareaId, e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const key = `${tareaId}-${subtareaId}`;
    setSubiendoKey(key);
    const resultado = await subirEvidenciaSubtarea(tareaId, subtareaId, files);
    setSubiendoKey(null);
    e.target.value = '';

    if (!resultado.ok) {
      alert(resultado.message);
    }
  };
  const handleEliminarFoto = async (tareaId, subtareaId, url) => {
    const confirmacion = await Swal.fire({
      title: '¿Eliminar esta foto?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c0392b',
      cancelButtonColor:  '#1a1f5e',
    });

    if (!confirmacion.isConfirmed) return;

    const resultado = await eliminarEvidenciaSubtarea(tareaId, subtareaId, url);

    if (!resultado.ok) {
      Swal.fire({
        title: 'Error',
        text: resultado.message,
        icon: 'error',
        confirmButtonColor: '#1a1f5e',
      });
      return;
    }

    Swal.fire({
      title: 'Foto eliminada',
      icon: 'success',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
    });
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
                        const key = `${tarea.id}-${sub.id}`;
                        const fotos = sub.evidencias || [];
                        const subiendo = subiendoKey === key;

                        return (
                          <div key={sub.id} className="subtarea-item-wrap">
                            <div className="subtarea-item">
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

                              {sr && (
                                <button
                                  className="btn-evidencia-mini"
                                  onClick={() => handleSeleccionarArchivo(tarea.id, sub.id)}
                                  disabled={subiendo || fotos.length >= MAX_FOTOS}
                                  title={fotos.length >= MAX_FOTOS ? `Máximo ${MAX_FOTOS} fotos` : 'Adjuntar evidencia'}
                                >
                                  <FiPaperclip />
                                  {subiendo ? 'Subiendo...' : fotos.length > 0 ? `${fotos.length} foto${fotos.length > 1 ? 's' : ''}` : 'Evidencia'}
                                </button>
                              )}

                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={el => fileInputRefs.current[key] = el}
                                onChange={(e) => handleArchivosElegidos(tarea.id, sub.id, e)}
                                style={{ display: 'none' }}
                              />
                            </div>

                            {/* Miniaturas de fotos ya subidas */}
                            {sr && fotos.length > 0 && (
                              <div className="evidencia-thumbs">
                                {fotos.map((url, i) => (
                                  <div key={i} className="evidencia-thumb-wrap">
                                    <a href={getImageUrl(url)} target="_blank" rel="noreferrer" className="evidencia-thumb">
                                      <img src={getImageUrl(url)} alt={`Evidencia ${i + 1}`} />
                                    </a>
                                    <button
                                      type="button"
                                      className="evidencia-thumb-delete"
                                      onClick={() => handleEliminarFoto(tarea.id, sub.id, url)}
                                      title="Eliminar esta foto"
                                    >
                                      <FiX />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
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