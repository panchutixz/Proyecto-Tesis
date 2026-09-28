import { useEffect } from 'react';
import { useAuth } from '@context/AuthContext.jsx';
import useGetSolicitudes from '@hooks/solicitudInsumo/useGetSolicitudes.jsx';
import useCrearSolicitud from '@hooks/solicitudInsumo/useCrearSolicitud.jsx';
import useResolverSolicitud from '@hooks/solicitudInsumo/useResolverSolicitud.jsx';
import useGetInsumo from '@hooks/insumo/useGetInsumo.jsx';
import { FiPlus, FiCheck, FiX, FiClock, FiPackage } from 'react-icons/fi';

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

  useEffect(() => {
    fetchSolicitudes();
    if (puedeSolicitar) fetchInsumos();
  }, []);

  const badgeClase = (estado) => {
    if (estado === 'Aprobada') return 'bg-[#2f7a31]';
    if (estado === 'Rechazada') return 'bg-[#c0392b]';
    return 'bg-[#b88d00]';
  };

  return (
    <div className="min-h-screen bg-[#ebf3fb] text-slate-900">
      <main className="min-h-screen px-8 py-8 flex justify-center">
        <div className="w-full max-w-5xl space-y-8">

          <section className="flex items-center justify-between">
            <div>
              <h1 className="text-[1.9rem] font-bold uppercase tracking-[0.25em] text-[#172651]">
                Solicitudes de Insumos
              </h1>
              <p className="text-sm text-[#5b78a2] mt-1">
                {puedeResolver ? 'Todas las solicitudes' : 'Tus solicitudes'}
              </p>
            </div>

            {puedeSolicitar && (
              <button
                onClick={handleCrearSolicitud}
                className="flex items-center gap-2 bg-[#1a1f5e] hover:bg-[#12154a] text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors"
              >
                <FiPlus /> Nueva Solicitud
              </button>
            )}
          </section>

          <section className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
            {loading ? (
              <p className="text-slate-500">Cargando solicitudes...</p>
            ) : solicitudes.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-slate-300 bg-[#f2f6ff] p-10 text-center text-slate-500">
                No hay solicitudes {puedeResolver ? 'registradas' : 'realizadas'} todavía.
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudes.map((s) => (
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