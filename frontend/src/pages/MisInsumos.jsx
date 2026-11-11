import "@styles/historialInsumos.css";
import { useEffect, useMemo, useRef, useState } from "react";
import useGetMisInsumos from "@hooks/insumo/useGetMisInsumos.jsx";
import { FiCalendar, FiChevronDown } from "react-icons/fi";

const TZ = "America/Santiago";

const formatFecha = (fechaISO) =>
  new Date(fechaISO).toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const claveDia = (fecha) =>
  new Date(fecha).toLocaleDateString("en-CA", { timeZone: TZ });

const hoyClave = () => claveDia(new Date());

const etiquetaDia = (clave) => {
  const [y, m, d] = clave.split("-").map(Number);
  const dia = new Date(y, m - 1, d).toLocaleDateString("es-CL", { weekday: "long" });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
};

const MisInsumos = () => {
  const { misInsumos, loading, fetchMisInsumos } = useGetMisInsumos();
  const [diaSel, setDiaSel] = useState(null); // null = hoy
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // Carga inicial + actualización automática cada 30 s (por si le aprueban una solicitud)
  useEffect(() => {
    fetchMisInsumos();
    const id = setInterval(() => fetchMisInsumos(true), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const cerrar = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const hoy = hoyClave();
  const diaActivo = diaSel || hoy;
  const esHoy = diaActivo === hoy;

  const diasConInsumos = useMemo(() => {
    const mapa = {};
    misInsumos.forEach((m) => {
      const k = claveDia(m.fecha);
      mapa[k] = (mapa[k] || 0) + 1;
    });
    return Object.entries(mapa).sort((a, b) => b[0].localeCompare(a[0]));
  }, [misInsumos]);

  const diasPrevios = diasConInsumos.filter(([k]) => k !== hoy);
  const cantHoy = diasConInsumos.find(([k]) => k === hoy)?.[1] || 0;

  const insumosDia = useMemo(
    () => misInsumos.filter((m) => claveDia(m.fecha) === diaActivo),
    [misInsumos, diaActivo]
  );

  const totalUnidades = insumosDia.reduce((acc, m) => acc + Number(m.cantidad || 0), 0);

  const elegirDia = (clave) => {
    setDiaSel(clave);
    setMenuAbierto(false);
  };

  return (
    <div className="historial-page">
      <div className="historial-header">
        <div className="historial-title-wrap">
          <h2>MIS INSUMOS</h2>
          <p className="historial-subtitle">
            Insumos que se te han entregado · {esHoy ? "hoy" : etiquetaDia(diaActivo)}
            {insumosDia.length > 0 && ` · ${insumosDia.length} registro(s), ${totalUnidades} unidad(es)`}
          </p>
        </div>

        <div className="historial-header-actions">
          <div className="dia-filtro" ref={menuRef}>
            <button
              className={`dia-filtro-btn ${!esHoy ? "active" : ""}`}
              onClick={() => setMenuAbierto((v) => !v)}
            >
              <FiCalendar />
              {esHoy ? "Hoy" : etiquetaDia(diaActivo)}
              <FiChevronDown />
            </button>

            {menuAbierto && (
              <div className="dia-filtro-menu">
                <button
                  className={`dia-opcion ${esHoy ? "active" : ""}`}
                  onClick={() => elegirDia(null)}
                >
                  <span>Hoy</span>
                  <span className="dia-count">{cantHoy} ins.</span>
                </button>

                <div className="dia-sep">Días anteriores con insumos</div>

                {diasPrevios.length === 0 ? (
                  <p className="dia-vacio">Aún no hay días anteriores con insumos.</p>
                ) : (
                  diasPrevios.map(([clave, n]) => (
                    <button
                      key={clave}
                      className={`dia-opcion ${diaActivo === clave ? "active" : ""}`}
                      onClick={() => elegirDia(clave)}
                    >
                      <span>{etiquetaDia(clave)}</span>
                      <span className="dia-count">{n} ins.</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="historial-table-wrapper">
        <table className="historial-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Insumo</th>
              <th>Cantidad</th>
              <th>Origen</th>
              <th>Jornada</th>
              <th>Entregado por</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}>Cargando tus insumos...</td></tr>
            ) : insumosDia.length > 0 ? (
              insumosDia.map((m) => (
                <tr key={m.id}>
                  <td>{formatFecha(m.fecha)}</td>
                  <td>{m.insumo_nombre}</td>
                  <td className="col-center">{m.cantidad}</td>
                  <td>
                    <span className={`historial-badge ${m.tipo === "Solicitud" ? "solicitud" : "entrega"}`}>
                      {m.tipo === "Solicitud" ? "Solicitud aprobada" : "Entrega"}
                    </span>
                  </td>
                  <td>{m.jornada || "—"}</td>
                  <td>{m.realizado_por_nombre || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  {esHoy
                    ? "Hoy no se te han entregado insumos."
                    : "No se te entregaron insumos este día."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MisInsumos;