import "@styles/insumos.css";
import "@styles/insumoCounter.css";                          // ← NUEVO
import useGetInsumo from "@hooks/insumo/useGetInsumo.jsx";
import useEntregarInsumos from "@hooks/insumo/useEntregarInsumos.jsx";  // ← NUEVO
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const estadoColors = {
  Normal: "#2e7d32",
  Bajo: "#b38e00",
  Agotado: "#c0392b",
};

function estadoStyle(estado) {
  const color = estadoColors[estado] || "#6c757d";
  return {
    backgroundColor: color,
    color: "#fff",
    padding: "4px 8px",
    borderRadius: 12,
    display: "inline-block",
    fontWeight: "bold",
  };
}

const Insumos = () => {
  const { user: authUser } = useAuth();
  const { insumos, fetchInsumos } = useGetInsumo();
  const { handleEntregarInsumos } = useEntregarInsumos(fetchInsumos);   // ← NUEVO

  useEffect(() => {
    fetchInsumos();
  }, []);

  return (
    <div className="insumos-page">
      <div className="insumos-header">
        <div className="insumos-title-wrap">
          <h2>LISTADO DE INSUMOS</h2>
          <p className="insumos-subtitle">— estado actual del almacén</p>
        </div>
        {authUser?.rol === "Administrador" && (
          <button className="insumos-addbtn" onClick={handleEntregarInsumos}>
            Entregar Insumos
          </button>
        )}
      </div>

      <div className="insumos-table-wrapper">
        <table className="insumos-table">
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Categoría</th>
              <th>Cant. Actual</th>
              <th>Unidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(insumos) && insumos.length > 0 ? (
              insumos.map((i) => (
                <tr key={i.id}>
                  <td>{i.nombre}</td>
                  <td>{i.categoria}</td>
                  <td>{i.cantidad}</td>
                  <td>{i.unidad}</td>
                  <td>
                    <span style={estadoStyle(i.estado)}>{i.estado}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay insumos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Insumos;