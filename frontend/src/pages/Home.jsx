import { useEffect } from 'react';
import { useTareas } from '@context/TareasContext.jsx';
import { useAuth } from '@context/AuthContext.jsx';
import useGetInsumo from '@hooks/insumo/useGetInsumo.jsx';
import { FiCheck, FiAlertCircle, FiPackage, FiAlertTriangle } from 'react-icons/fi';

const Home = () => {
  const { totalTareas, tareasRealizadas, tareasNoRealizadas, actividadReciente } = useTareas();
  const { user } = useAuth();
  const { insumos, fetchInsumos } = useGetInsumo();

  const rol = user?.rol;
  const puedeVerInsumos = rol === 'Administrador' || rol === 'Bodeguero';

  useEffect(() => {
    if (puedeVerInsumos) fetchInsumos();
  }, [puedeVerInsumos]);

  const insumosBajo    = insumos.filter(i => i.estado === 'Bajo').length;
  const insumosAgotados = insumos.filter(i => i.estado === 'Agotado').length;
  const totalInsumos   = insumos.length;

  return (
    <div className="min-h-screen bg-[#ebf3fb] text-slate-900">
      <main className="min-h-screen px-8 py-8 flex justify-center">
        <div className="w-full max-w-6xl space-y-8">

          <section className="text-center">
            <h1 className="text-[1.9rem] font-bold uppercase tracking-[0.35em] text-[#172651]">
              Resumen del día
            </h1>
          </section>

          {/* Stat cards — Tareas */}
          <section className="grid gap-6 md:grid-cols-3">
            {[
              { label:'Tareas designadas', value:totalTareas,        bar:'bg-[#172651]', num:'text-[#172651]' },
              { label:'Realizadas',        value:tareasRealizadas,   bar:'bg-[#2f7a31]', num:'text-[#2f7a31]' },
              { label:'No realizadas',     value:tareasNoRealizadas, bar:'bg-[#b88d00]', num:'text-[#b88d00]' },
            ].map((s, i) => (
              <article key={i} className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
                <div className={`mb-5 h-2 w-24 rounded-full ${s.bar}`} />
                <p className="text-sm uppercase tracking-[0.25em] text-[#5b78a2] mb-4">{s.label}</p>
                <p className={`text-[4rem] font-bold leading-none ${s.num}`}>{s.value}</p>
              </article>
            ))}
          </section>

          {/* Stat cards — Insumos (solo Admin / Bodeguero) */}
          {puedeVerInsumos && (
            <section>
              <h2 className="text-xl font-bold uppercase tracking-[0.25em] text-[#172651] mb-4">
                Estado del Almacén
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <article className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
                  <div className="mb-5 h-2 w-24 rounded-full bg-[#172651]" />
                  <div className="flex items-center gap-2 mb-4">
                    <FiPackage className="text-[#5b78a2]" />
                    <p className="text-sm uppercase tracking-[0.25em] text-[#5b78a2]">Insumos registrados</p>
                  </div>
                  <p className="text-[4rem] font-bold leading-none text-[#172651]">{totalInsumos}</p>
                </article>

                <article className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
                  <div className="mb-5 h-2 w-24 rounded-full bg-[#b88d00]" />
                  <div className="flex items-center gap-2 mb-4">
                    <FiAlertCircle className="text-[#5b78a2]" />
                    <p className="text-sm uppercase tracking-[0.25em] text-[#5b78a2]">Insumos con stock bajo</p>
                  </div>
                  <p className="text-[4rem] font-bold leading-none text-[#b88d00]">{insumosBajo}</p>
                </article>

                <article className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
                  <div className="mb-5 h-2 w-24 rounded-full bg-[#c0392b]" />
                  <div className="flex items-center gap-2 mb-4">
                    <FiAlertTriangle className="text-[#5b78a2]" />
                    <p className="text-sm uppercase tracking-[0.25em] text-[#5b78a2]">Insumos agotados</p>
                  </div>
                  <p className="text-[4rem] font-bold leading-none text-[#c0392b]">{insumosAgotados}</p>
                </article>
              </div>
            </section>
          )}

          {/* Actividad reciente con scroll */}
          <section className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
            <h2 className="text-xl font-bold uppercase tracking-[0.25em] text-[#172651] mb-6">
              Actividad reciente
            </h2>

            {actividadReciente.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-slate-300 bg-[#f2f6ff] p-10 text-center text-slate-500">
                No hay actividad reciente.
              </div>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {actividadReciente.map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 rounded-[16px] border border-slate-100 p-4 shadow-sm ${
                      i % 2 === 0 ? 'bg-white' : 'bg-[#f8fafd]'
                    }`}
                  >
                    <div className={`w-1 h-10 rounded-full flex-shrink-0 ${
                      item.status === 'realizada' ? 'bg-[#2f7a31]' : 'bg-[#b88d00]'
                    }`} />
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white font-bold text-sm flex-shrink-0 ${
                      item.status === 'realizada' ? 'bg-[#2f7a31]' : 'bg-[#b88d00]'
                    }`}>
                      {item.status === 'realizada' ? <FiCheck /> : <FiAlertCircle />}
                    </div>
                    <span className="flex-1 text-sm text-slate-700">
                      <strong className="text-slate-900">
                        {item.status === 'realizada' ? 'Tarea realizada' : 'Tarea pendiente'}
                      </strong>
                      {' — '}{item.title}{'  |  '}{item.description}{'  |  '}{item.time}
                    </span>
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

export default Home;