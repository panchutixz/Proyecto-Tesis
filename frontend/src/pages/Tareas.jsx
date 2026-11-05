import '@styles/tareas.css';
import { useState, useRef, useEffect, useMemo }  from 'react';
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
  FiCalendar,
  FiClock,
} from 'react-icons/fi';

const BASE_URL   = import.meta.env.VITE_BASE_URL || '';
const MAX_FOTOS  = 4;

const TZ = 'America/Santiago';

// "2026-11-05" (día en hora de Chile)
const claveDia = (fecha) =>
  new Date(fecha || Date.now()).toLocaleDateString('en-CA', { timeZone: TZ });

// "Jueves 05-11-2026"
const etiquetaDia = (clave) => {
  const [y, m, d] = clave.split('-').map(Number);
  const dia = new Date(y, m - 1, d).toLocaleDateString('es-CL', { weekday: 'long' });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
};

const Tareas = () => {
  const { user }                                    = useAuth();
    const { tareas, loading, fetchTareas,
          agregarTareaLocal, toggleSubtarea,
          subirEvidenciaSubtarea, eliminarEvidenciaSubtarea } = useTareas();
  const { handleCreateTarea }                       = useCreateTarea(fetchTareas, agregarTareaLocal);
  const { handleEditTarea }                         = useEditTarea(fetchTareas);
  const { handleDeleteTarea }                       = useDeleteTarea(fetchTareas);

  const rol     = user?.rol?.toLowerCase();
  const puedeGestionarTareas = rol === 'administrador' || rol === 'supervisor';
  const isAdmin = puedeGestionarTareas;   // se mantiene el nombre para no romper el resto del archivo
  const isEmpleado = !isAdmin;

  const jornadaEmpleado = user?.jornada || 'Mañana';
  const [jornada, setJornada]   = useState(isEmpleado ? jornadaEmpleado : 'Mañana');
  const [expanded, setExpanded] = useState({});
  const [subiendoKey, setSubiendoKey] = useState(null); // `${tareaId}-${subtareaId}`
    const fileInputRefs = useRef({});

  const [diaSel, setDiaSel]           = useState(null); // null = hoy
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // Cierra el menú de días al hacer clic fuera
  useEffect(() => {
    const cerrar = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false);
    };
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, []);

  const hoy       = claveDia();
  const diaActivo = diaSel || hoy;
  const esHoy     = diaActivo === hoy;

  const diaCreacion    = (t) => claveDia(t.created_at);
  const diaActualizada = (t) => claveDia(t.updated_at || t.created_at);
  const pendiente      = (t) => t.estado !== 'Realizado';

  // Días anteriores en que se asignaron tareas (más reciente primero)
  const diasPrevios = useMemo(() => {
    const mapa = {};
    tareas.forEach(t => {
      const k = diaCreacion(t);
      if (k !== hoy) mapa[k] = (mapa[k] || 0) + 1;
    });
    return Object.entries(mapa).sort((a, b) => b[0].localeCompare(a[0]));
  }, [tareas, hoy]);

  const elegirDia = (clave) => {
    setDiaSel(clave);
    setMenuAbierto(false);
  };

  // Hoy: tareas de hoy + las que siguen pendientes + las terminadas hoy.
  // Otro día: las tareas asignadas ese día.
  const visibles = tareas.filter(t =>
    esHoy
      ? (diaCreacion(t) === hoy || diaActualizada(t) === hoy || pendiente(t))
      : diaCreacion(t) === diaActivo
  );

  const toggle    = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const filtradas = visibles.filter(t => t.jornada === jornada);

  const getImageUrl = (path) => `${BASE_URL.replace('/api', '')}${path}`;

  const handleSeleccionarArchivo = (tareaId, subtareaId) => {
    fileInputRefs.current[`${tareaId}-${subtareaId}`]?.click();
  };

const handleArchivosElegidos = async (tareaId, subtareaId, e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const key = `${tareaId}-${subtareaId}`;
  const tareaActual = tareas.find(t => t.id === tareaId);
  const subActual   = tareaActual?.subtareas?.find(s => s.id === subtareaId);
  const fotosActuales      = subActual?.evidencias?.length || 0;
  const espacioDisponible  = MAX_FOTOS - fotosActuales;

  if (files.length > espacioDisponible) {
    Swal.fire({
      title: 'Demasiadas fotos',
      text: `Solo puedes adjuntar hasta ${MAX_FOTOS} fotos por subtarea. Puedes agregar ${espacioDisponible} foto${espacioDisponible !== 1 ? 's' : ''} más.`,
      icon: 'warning',
      confirmButtonColor: '#1a1f5e',
    });
    e.target.value = '';
    return;
  }

  setSubiendoKey(key);
  const resultado = await subirEvidenciaSubtarea(tareaId, subtareaId, files);
  setSubiendoKey(null);
  e.target.value = '';

  if (!resultado.ok) {
    Swal.fire({
      title: 'Error al subir evidencia',
      text: resultado.message,
      icon: 'error',
      confirmButtonColor: '#1a1f5e',
    });
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
          <p className="tareas-subtitle">
            — Jornada {jornada} · {esHoy ? 'hoy' : etiquetaDia(diaActivo)}
          </p>
        </div>

        <div className="tareas-header-right">
          <div className="dia-filtro" ref={menuRef}>
            <button
              className={`dia-filtro-btn ${!esHoy ? 'active' : ''}`}
              onClick={() => setMenuAbierto(v => !v)}
            >
              <FiCalendar />
              {esHoy ? 'Hoy' : etiquetaDia(diaActivo)}
              <FiChevronDown />
            </button>

            {menuAbierto && (
              <div className="dia-filtro-menu">
                <button
                  className={`dia-opcion ${esHoy ? 'active' : ''}`}
                  onClick={() => elegirDia(null)}
                >
                  <span>Hoy</span>
                </button>

                <div className="dia-sep">Días anteriores con tareas</div>

                {diasPrevios.length === 0 ? (
                  <p className="dia-vacio">Aún no hay días anteriores con tareas.</p>
                ) : (
                  diasPrevios.map(([clave, n]) => (
                    <button
                      key={clave}
                      className={`dia-opcion ${diaActivo === clave ? 'active' : ''}`}
                      onClick={() => elegirDia(clave)}
                    >
                      <span>{etiquetaDia(clave)}</span>
                      <span className="dia-count">{n} tarea{n > 1 ? 's' : ''}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

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
        <p className="tareas-empty">
          {esHoy
            ? `Hoy no hay tareas para la jornada ${jornada}.`
            : `No hay tareas de ese día para la jornada ${jornada}.`}
        </p>
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
                        {esHoy && diaCreacion(tarea) !== hoy && pendiente(tarea) && (
                          <> &nbsp;|&nbsp; <FiClock className="meta-icon" /> Pendiente desde {etiquetaDia(diaCreacion(tarea))}</>
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