import "@styles/asistencia.css";
import useAsistencia from "@hooks/asistencia/useAsistencia.jsx";
import { FiDownload, FiCheck } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const hoyTexto = () => {
  const t = new Date().toLocaleDateString("es-CL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const horaTexto = (iso) =>
  new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

const textoObservacion = (r) => {
  if (!r.motivo && !r.comentario) return "—";
  return [r.motivo, r.comentario].filter(Boolean).join(" — ");
};

const Asistencia = () => {
  const {
    jornada, setJornada, filas, guardado, dirty, loading, saving, resumen,
    togglePresente, marcarTodosPresentes, dejarObservacion, guardarAsistencia,
  } = useAsistencia();

  const puedeDescargar = Boolean(guardado) && !dirty;

  // PDF con lo que quedó guardado en la base de datos (jornada, hora, presentes/ausentes y quién lo realizó)
  const descargarPDF = () => {
    if (!guardado) return;
    const doc = new jsPDF({ orientation: "portrait" });
    const ancho = doc.internal.pageSize.getWidth();
    const alto = doc.internal.pageSize.getHeight();

    // Encabezado
    doc.setFillColor(26, 31, 94);
    doc.rect(0, 0, ancho, 28, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("ASEO SF", 14, 13);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(232, 184, 0);
    doc.text("Aseo Industrial", 14, 20);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Registro de Asistencia", ancho - 14, 16, { align: "right" });

    // Datos del registro
    const fechaLarga = new Date(`${guardado.fecha}T12:00:00`).toLocaleDateString("es-CL", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const meta = [
      ["JORNADA", guardado.jornada],
      ["FECHA", fechaLarga],
      ["HORA DEL REGISTRO", horaTexto(guardado.guardado_en)],
      ["REALIZADO POR", guardado.realizado_por_nombre || "—"],
    ];
    meta.forEach(([label, valor], i) => {
      const x = 14 + (i % 2) * 96;
      const y = 40 + Math.floor(i / 2) * 16;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(107, 124, 176);
      doc.text(label, x, y);
      doc.setFontSize(10);
      doc.setTextColor(26, 31, 94);
      doc.text(String(valor), x, y + 6);
    });

    // Tabla
    const registros = guardado.registros;
    autoTable(doc, {
      startY: 76,
      head: [["Nombre", "Apellido", "Estado", "Observación"]],
      body: registros.map((r) => [
        r.trabajador_nombre,
        r.trabajador_apellido || "",
        r.presente ? "Presente" : "Ausente",
        textoObservacion(r),
      ]),
      headStyles: { fillColor: [26, 31, 94], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [244, 248, 252] },
      styles: { fontSize: 9, cellPadding: 3.5, textColor: [26, 31, 94] },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = data.cell.raw === "Presente" ? [26, 110, 62] : [192, 57, 43];
        }
      },
    });

    // Totales
    const presentes = registros.filter((r) => r.presente).length;
    const conObs = registros.filter((r) => r.motivo || r.comentario).length;
    const yTot = doc.lastAutoTable.finalY + 8;
    doc.setFillColor(208, 232, 250);
    doc.rect(14, yTot, ancho - 28, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(24, 95, 165);
    doc.text(
      `Total: ${registros.length}  ·  Presentes: ${presentes}  ·  Ausentes: ${registros.length - presentes}  ·  Con observación: ${conObs}`,
      18, yTot + 6
    );

    // Pie de página
    const paginas = doc.getNumberOfPages();
    for (let p = 1; p <= paginas; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(107, 124, 176);
      doc.text("Documento generado por el sistema Aseo San Francisco", ancho / 2, alto - 8, { align: "center" });
    }

    const jornadaArchivo = guardado.jornada.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    doc.save(`asistencia_${jornadaArchivo}_${guardado.fecha}.pdf`);
  };

  return (
    <div className="asist-page">
      {/* Encabezado */}
      <div className="asist-header">
        <div className="asist-title-wrap">
          <h2>ASISTENCIA</h2>
          <p className="asist-subtitle">{hoyTexto()} — pasar lista y guardar el registro del día</p>
        </div>

        <div className="asist-jornada">
          <span className="asist-label">Jornada</span>
          <div className="asist-pills">
            {["Mañana", "Tarde"].map((j) => (
              <button
                key={j}
                className={`asist-pill ${jornada === j ? "active" : ""}`}
                onClick={() => setJornada(j)}
              >
                {j}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de la jornada */}
      <div className="asist-resumen">
        <div className="asist-stat presentes">Presentes: <strong>{resumen.presentes}</strong></div>
        <div className="asist-stat ausentes">Ausentes: <strong>{resumen.ausentes}</strong></div>
        <div className="asist-stat">Con observación: <strong>{resumen.conObservacion}</strong></div>
        <button
          className="asist-marcar-todos"
          onClick={marcarTodosPresentes}
          disabled={filas.length === 0}
        >
          Marcar a todos presentes
        </button>
      </div>

      {/* Lista */}
      <div className="asist-table-wrapper">
        <table className="asist-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>¿Presente?</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}>Cargando lista...</td></tr>
            ) : filas.length > 0 ? (
              filas.map((f) => (
                <tr key={f.id}>
                  <td className="asist-nombre">{f.nombre}</td>
                  <td>{f.apellido}</td>
                  <td>
                    <button
                      type="button"
                      className={`asist-toggle ${f.presente ? "si" : "no"}`}
                      onClick={() => togglePresente(f.id)}
                      aria-pressed={f.presente}
                      aria-label={`${f.presente ? "Presente" : "Ausente"}: ${f.nombre} ${f.apellido}`}
                    >
                      <span className="asist-toggle-label">{f.presente ? "Sí" : "No"}</span>
                      <span className="asist-toggle-knob" />
                    </button>
                  </td>
                  <td>
                    <div className="asist-obs-cell">
                      <button type="button" className="asist-obs-btn" onClick={() => dejarObservacion(f)}>
                        {f.motivo || f.comentario ? "Editar observación" : "Dejar observación"}
                      </button>
                      {(f.motivo || f.comentario) && (
                        <span className="asist-obs-chip" title={f.comentario || ""}>
                          {f.motivo || "Observación"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4}>No hay trabajadores asignados a esta jornada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Aviso */}
      {guardado && !dirty ? (
        <div className="asist-info guardada" role="status">
          <FiCheck />
          <span>
            Asistencia de la jornada {guardado.jornada} guardada a las {horaTexto(guardado.guardado_en)} por{" "}
            {guardado.realizado_por_nombre || "—"}. Ya puedes descargar el PDF.
          </span>
        </div>
      ) : (
        <div className="asist-info">
          {guardado && dirty
            ? "Tienes cambios sin guardar. Presiona “Actualizar asistencia” para guardarlos."
            : "Marca “Sí” a quien esté presente. Al guardar, se registra quién asistió y quién no en esta jornada."}
        </div>
      )}

      {/* Acciones */}
      <div className="asist-actions">
        <div className="asist-pdf-wrap">
          <button className="asist-pdfbtn" onClick={descargarPDF} disabled={!puedeDescargar}>
            <FiDownload /> Descargar PDF
          </button>
          {!puedeDescargar && (
            <span className="asist-pdf-hint">
              {guardado ? "Guarda los cambios para descargar" : "Se habilita al guardar"}
            </span>
          )}
        </div>

        <button
          className="asist-savebtn"
          onClick={guardarAsistencia}
          disabled={saving || filas.length === 0}
        >
          {saving ? "Guardando..." : guardado ? "Actualizar asistencia" : "Guardar asistencia"}
        </button>
      </div>
    </div>
  );
};

export default Asistencia;