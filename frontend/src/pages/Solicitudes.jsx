import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@context/AuthContext.jsx';
import useGetSolicitudes from '@hooks/solicitudInsumo/useGetSolicitudes.jsx';
import useCrearSolicitud from '@hooks/solicitudInsumo/useCrearSolicitud.jsx';
import useResolverSolicitud from '@hooks/solicitudInsumo/useResolverSolicitud.jsx';
import useGetInsumo from '@hooks/insumo/useGetInsumo.jsx';
import { FiPlus, FiCheck, FiX, FiClock, FiPackage, FiCalendar, FiChevronDown } from 'react-icons/fi';
import '@styles/historialInsumos.css'; // reutiliza los estilos del filtro de días

const TZ = 'America/Santiago';

// "2026-11-05" (día en hora de Chile) a partir de una fecha
const claveDia = (fecha) =>
  new Date(fecha).toLocaleDateString('en-CA', { timeZone: TZ });

const hoyClave = () => claveDia(new Date());

// "Jueves 05-11-2026"
const etiquetaDia = (clave) => {
  const [y, m, d] = clave.split('-').map(Number);
  const dia = new Date(y, m - 1, d).toLocaleDateString('es-CL', { weekday: 'long' });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
};

const Solicitudes = () => {
  const { user } = useAuth();
  const rol = user?.rol?.toLowerCase();
  const puedeSolicitar = rol === 'supervisor' || rol === 'empleado';
  const puedeResolver  = rol === 'administrador' || rol === 'bodeguero';

  const { solicitudes, loading, fetchSolicitudes } = useGetSolicitudes();
  const { insumos, fetchInsumos } = useGetInsumo();
  const puedeVerStock = rol === 'supervisor';
  const { handleCrearSolicitud } = useCrearSolicitud(fetchSolicitudes, insumos, puedeVerStock);
  const { handleAprobar, handleRechazar } = useResolverSolicitud(fetchSolicitudes);

  const [jornada, setJornada] = useState('Todas');
  const [diaSel, setDiaSel] = useState(null); // null = hoy, 'pendientes' o 'YYYY-MM-DD'
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchSolicitudes();
    if (puedeSolicitar) fetchInsumos();
  }, []);

  // Cierra el menú de días al hacer clic fuera
  useEffect(() => {
    const cerrar = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false);
    };
    document.addEventListener('mousedown', cerrar);
    return () => document.removeEventListener('mousedown', cerrar);
  }, []);

  const hoy = hoyClave();
  const verPendientes = diaSel === 'pendientes';
  const diaActivo = verPendientes ? null : (diaSel || hoy);
  const esHoy = !verPendientes && diaActivo === hoy;

  // Primero el filtro de jornada (solo administrador y bodeguero)
  const solicitudesJornada = puedeResolver && jornada !== 'Todas'
    ? solicitudes.filter(s => s.solicitante_jornada === jornada)
    : solicitudes;

  // Cantidad de solicitudes por día (más reciente primero)
  const diasConSolicitudes = useMemo(() => {
    const mapa = {};
    solicitudesJornada.forEach((s) => {
      const k = claveDia(s.created_at);
      mapa[k] = (mapa[k] || 0) + 1;
    });
    return Object.entries(mapa).sort((a, b) => b[0].localeCompare(a[0]));
  }, [solicitudesJornada]);

  const diasPrevios = diasConSolicitudes.filter(([k]) => k !== hoy);
  const solsHoy = diasConSolicitudes.find(([k]) => k === hoy)?.[1] || 0;
  const totalPendientes = solicitudesJornada.filter(s => s.estado === 'Pendiente').length;

  // Lista que se muestra: pendientes de cualquier día, o las del día elegido
  const solicitudesFiltradas = verPendientes
    ? solicitudesJornada.filter(s => s.estado === 'Pendiente')
    : solicitudesJornada.filter(s => claveDia(s.created_at) === diaActivo);

  const elegirDia = (valor) => {
    setDiaSel(valor);
    setMenuAbierto(false);
  };

  const textoDia = verPendientes ? 'pendientes' : (esHoy ? 'hoy' : etiquetaDia(diaActivo));
  const mensajeVacio = verPendientes
    ? 'No hay solicitudes pendientes.'
    : esHoy
      ? 'Hoy no hay solicitudes registradas.'
      : 'No hay solicitudes registradas para este día.';

  const badgeClase = (estado) => {
    if (estado === 'Aprobada') return 'bg-[#2f7a31]';
    if (estado === 'Rechazada') return 'bg-[#c0392b]';
    return 'bg-[#b88d00]';
  };

  return (
    <div className="min-h-screen bg-[#ebf3fb] text-slate-900">
      <main className="min-h-screen px-8 py-8 flex justify-center">
        <div className="w-full max-w-5xl space-y-8">

          <section className="historial-header" style={{ marginBottom: 0 }}>
            <div className="historial-title-wrap">
              <h2>Solicitudes de Insumos</h2>
              <p className="historial-subtitle">
                {puedeResolver
                  ? (jornada === 'Todas' ? 'Todas las jornadas' : `Jornada ${jornada}`)
                  : 'Tus solicitudes'}
                {' · '}{textoDia}
              </p>
            </div>

            <div className="historial-header-actions">
              <div className="dia-filtro" ref={menuRef}>
                <button
                  className={`dia-filtro-btn ${!esHoy ? 'active' : ''}`}
                  onClick={() => setMenuAbierto((v) => !v)}
                >
                  <FiCalendar />
                  {verPendientes ? 'Pendientes' : (esHoy ? 'Hoy' : etiquetaDia(diaActivo))}
                  <FiChevronDown />
                </button>

                {menuAbierto && (
                  <div className="dia-filtro-menu">
                    <button
                      className={`dia-opcion ${esHoy ? 'active' : ''}`}
                      onClick={() => elegirDia(null)}
                    >
                      <span>Hoy</span>
                      <span className="dia-count">{solsHoy} sol.</span>
                    </button>

                    <button
                      className={`dia-opcion ${verPendientes ? 'active' : ''}`}
                      onClick={() => elegirDia('pendientes')}
                    >
                      <span>Pendientes (todos los días)</span>
                      <span className="dia-count">{totalPendientes} sol.</span>
                    </button>

                    <div className="dia-sep">Días anteriores con solicitudes</div>

                    {diasPrevios.length === 0 ? (
                      <p className="dia-vacio">Aún no hay días anteriores con solicitudes.</p>
                    ) : (
                      diasPrevios.map(([clave, n]) => (
                        <button
                          key={clave}
                          className={`dia-opcion ${diaActivo === clave ? 'active' : ''}`}
                          onClick={() => elegirDia(clave)}
                        >
                          <span>{etiquetaDia(clave)}</span>
                          <span className="dia-count">{n} sol.</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {puedeResolver && (
                <div className="jornada-pills">
                  {['Todas', 'Mañana', 'Tarde'].map(j => (
                    <button
                      key={j}
                      className={`jornada-pill ${jornada === j ? 'active' : ''}`}
                      onClick={() => setJornada(j)}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              )}

              {puedeSolicitar && (
                <button
                  onClick={handleCrearSolicitud}
                  className="flex items-center gap-2 bg-[#1a1f5e] hover:bg-[#12154a] text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
                >
                  <FiPlus /> Nueva Solicitud
                </button>
              )}
            </div>
          </section>

          <section className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
            {loading ? (
              <p className="text-slate-500">Cargando solicitudes...</p>
            ) : solicitudesFiltradas.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-slate-300 bg-[#f2f6ff] p-10 text-center text-slate-500">
                {mensajeVacio}
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudesFiltradas.map((s) => (
                  <div key={s.id} className="rounded-[20px] border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#eef3fb] text-[#5b78a2] flex-shrink-0">
                          <FiPackage />
                        </div>
                        <div>
                          <p className="font-semibold text-[#172651]">
                            {s.insumo_nombre} — {s.cantidad} unidad{s.cantidad !== 1 ? 'es' : ''}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            Solicitado por <strong>{s.solicitante_nombre}</strong>
                            {s.solicitante_jornada && <> — Jornada {s.solicitante_jornada}</>}
                            {' · '}
                            {new Date(s.created_at).toLocaleString('es-CL')}
                          </p>
                          {s.estado === 'Rechazada' && s.comentario_rechazo && (
                            <p className="text-sm text-[#c0392b] mt-2">
                              Motivo del rechazo: {s.comentario_rechazo}
                            </p>
                          )}
                          {s.estado !== 'Pendiente' && s.resuelto_por_nombre && (
                            <p className="text-xs text-slate-400 mt-1">
                              Resuelto por {s.resuelto_por_nombre}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className={`text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full flex items-center gap-1 flex-shrink-0 ${badgeClase(s.estado)}`}>
                        {s.estado === 'Pendiente' && <FiClock />}
                        {s.estado === 'Aprobada' && <FiCheck />}
                        {s.estado === 'Rechazada' && <FiX />}
                        {s.estado}
                      </span>
                    </div>

                    {puedeResolver && s.estado === 'Pendiente' && (
                      <div className="flex gap-3 mt-4 justify-end">
                        <button
                          onClick={() => handleRechazar(s)}
                          className="px-4 py-2 rounded-full text-sm font-semibold border border-[#c0392b] text-[#c0392b] hover:bg-[#c0392b] hover:text-white transition-colors"
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleAprobar(s)}
                          className="px-4 py-2 rounded-full text-sm font-semibold bg-[#2f7a31] text-white hover:bg-[#256226] transition-colors"
                        >
                          Aprobar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

export default Solicitudes;