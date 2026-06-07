import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';

const Home = () => {
  const [summary, setSummary] = useState({ assigned: 0, completed: 0, pending: 0 });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    setSummary({ assigned: 0, completed: 0, pending: 0 });
    setActivity([]);
  }, []);

  return (
    <div className="min-h-screen bg-[#ebf3fb] text-slate-900">
      <Sidebar />

      <main className="ml-72 min-h-screen px-8 py-8 flex justify-center">
        <div className="w-full max-w-6xl space-y-8">
          <section className="text-center">
            <h1 className="text-[1.9rem] font-bold uppercase tracking-[0.35em] text-[#172651]">
              Resumen del día
            </h1>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            <article className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
              <div className="mb-5 h-2 w-24 rounded-full bg-[#172651]"></div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#5b78a2] mb-4">
                Tareas designadas
              </p>
              <p className="text-[4rem] font-bold leading-none text-[#172651]">
                {summary.assigned}
              </p>
            </article>

            <article className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
              <div className="mb-5 h-2 w-24 rounded-full bg-[#2f7a31]"></div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#5b78a2] mb-4">
                Realizadas
              </p>
              <p className="text-[4rem] font-bold leading-none text-[#2f7a31]">
                {summary.completed}
              </p>
            </article>

            <article className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
              <div className="mb-5 h-2 w-24 rounded-full bg-[#b88d00]"></div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#5b78a2] mb-4">
                No realizadas
              </p>
              <p className="text-[4rem] font-bold leading-none text-[#b88d00]">
                {summary.pending}
              </p>
            </article>
          </section>

          <section className="rounded-[30px] bg-white p-8 shadow-[0_10px_60px_-40px_rgba(0,0,0,0.4)]">
            <div className="mb-6">
              <h2 className="text-xl font-bold uppercase tracking-[0.25em] text-[#172651]">
                Actividad reciente
              </h2>
            </div>

            {activity.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-slate-300 bg-[#f2f6ff] p-10 text-center text-slate-500">
                No hay actividad reciente.
              </div>
            ) : (
              <div className="space-y-4">
                {activity.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        item.status === 'realizada'
                          ? 'bg-[#2f7a31] text-white'
                          : item.status === 'pendiente'
                          ? 'bg-[#b88d00] text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {item.status === 'realizada' ? '✓' : item.status === 'pendiente' ? '!' : '•'}
                    </div>
                    <div className="flex-1 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p>{item.description}</p>
                    </div>
                    <span className="text-sm text-slate-500">{item.time}</span>
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
