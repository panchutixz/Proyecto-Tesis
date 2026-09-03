import "@styles/historialInsumos.css";
import { useEffect, useState } from "react";
import useGetMovimientos from "@hooks/insumo/useGetMovimientos.jsx";
import { FiDownload } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatFecha = (fechaISO) => {
  const d = new Date(fechaISO);
  return d.toLocaleString("es-CL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const HistorialInsumos = () => {
  const { movimientos, loading, fetchMovimientos } = useGetMovimientos();
  const [jornada, setJornada] = useState("Todas");

  useEffect(() => {
    fetchMovimientos(jornada);
  }, [jornada]);

  const descargarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.setTextColor(26, 31, 94);
    doc.text("Historial de Movimientos de Insumos", 14, 16);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Filtro de jornada: ${jornada}`, 14, 23);
    doc.text(`Generado: ${new Date().toLocaleString("es-CL")}`, 14, 28);

    const filas = movimientos.map((m) => [
      formatFecha(m.fecha),
      m.tipo,
      m.insumo_nombre,
      m.cantidad,
      m.jornada || "—",
      m.trabajador_nombre || "—",
      m.realizado_por_nombre || "—",
    ]);

    autoTable(doc, {
      startY: 34,
      head: [["Fecha", "Tipo", "Insumo", "Cantidad", "Jornada", "Trabajador", "Realizado por"]],
      body: filas,
      headStyles: { fillColor: [26, 31, 94], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [244, 248, 252] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 3: { halign: "center" } },
    });

    const nombreArchivo = `historial_insumos_${jornada.toLowerCase()}_${Date.now()}.pdf`;
    doc.save(nombreArchivo);
  };

  return (
    <div className="historial-page">
      <div className="historial-header">
        <div className="historial-title-wrap">
          <h2>HISTORIAL DE MOVIMIENTOS</h2>
          <p className="historial-subtitle">— entregas y reposiciones de insumos</p>
        </div>

        <div className="historial-header-actions">
          <div className="jornada-pills">
            {["Todas", "Mañana", "Tarde"].map((j) => (
              <button
                key={j}
                className={`jornada-pill ${jornada === j ? "active" : ""}`}
                onClick={() => setJornada(j)}
              >
                {j}
              </button>
            ))}
          </div>

          <button className="historial-pdfbtn" onClick={descargarPDF} disabled={movimientos.length === 0}>
            <FiDownload /> Descargar PDF
          </button>
        </div>
      </div>

      <div className="historial-table-wrapper">
        <table className="historial-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Insumo</th>
              <th>Cantidad</th>
              <th>Jornada</th>
              <th>Trabajador</th>
              <th>Realizado por</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7">Cargando historial...</td></tr>
            ) : movimientos.length > 0 ? (
              movimientos.map((m) => (
                <tr key={m.id}>
                  <td>{formatFecha(m.fecha)}</td>
                  <td>
                    <span className={`historial-badge ${m.tipo === "Entrega" ? "entrega" : "reposicion"}`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td>{m.insumo_nombre}</td>
                  <td className="col-center">{m.cantidad}</td>
                  <td>{m.jornada || "—"}</td>
                  <td>{m.trabajador_nombre || "—"}</td>
                  <td>{m.realizado_por_nombre || "—"}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7">No hay movimientos registrados para este filtro.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialInsumos;