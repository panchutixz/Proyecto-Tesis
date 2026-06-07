import { Link } from 'react-router-dom';

const Error404 = () => {
  return (
    <div className="min-h-screen bg-[#141b52] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl overflow-hidden rounded-[36px] bg-white/95 px-8 py-10 shadow-[0_35px_120px_-25px_rgba(15,21,76,0.35)] sm:px-12 sm:py-14">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1b2d6e] text-white shadow-xl">
          <span className="text-lg font-semibold">SF</span>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-[#b18f1f]">
            ASEO INDUSTRIAL
          </p>
          <h1 className="mt-6 text-[5rem] font-black leading-none text-[#141b52] sm:text-[6rem]">
            404
          </h1>
          <p className="mt-4 text-xl font-semibold text-slate-900">
            Esta página no fue encontrada
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            Parece que este rincón todavía no ha sido asignado a ningún trabajador. La página que buscas no existe o fue trasladada.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 text-[#b18f1f]">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f8eed2] border border-[#d5bf82]">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
                <line x1="8" y1="8" x2="14" y2="14" />
              </svg>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f8eed2] border border-[#d5bf82]">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l16 16" />
                <circle cx="12" cy="12" r="7" />
              </svg>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#f8eed2] border border-[#d5bf82]">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v6l4 2" />
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
              </svg>
            </div>
          </div>

          <Link
            to="/home"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-[#141b52] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#0f183f]"
          >
            ← Volver al inicio
          </Link>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              Seguridad
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              Registro
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
              Limpieza
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404;
