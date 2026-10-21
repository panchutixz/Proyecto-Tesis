import "@styles/insumos.css";
import "@styles/insumoCounter.css";
import useGetInsumo from "@hooks/insumo/useGetInsumo.jsx";
import useEntregarInsumos from "@hooks/insumo/useEntregarInsumos.jsx";
import useReponerInsumos from "@hooks/insumo/useReponerInsumos.jsx";
import useCreateInsumo from "@hooks/insumo/useCreateInsumo.jsx";
import useEditInsumo from "@hooks/insumo/useEditInsumo.jsx";       // ← NUEVO
import useDeleteInsumo from "@hooks/insumo/useDeleteInsumo.jsx";   // ← NUEVO
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

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
  const { handleEntregarInsumos } = useEntregarInsumos(fetchInsumos);
  const { handleReponerInsumos }  = useReponerInsumos(fetchInsumos);
  const { handleCreateInsumo }    = useCreateInsumo(fetchInsumos);
  const { handleEditInsumo }      = useEditInsumo(fetchInsumos);     // ← NUEVO
  const { handleDeleteInsumo }    = useDeleteInsumo(fetchInsumos);   // ← NUEVO

  useEffect(() => {
    fetchInsumos();
  }, []);

  const rol = authUser?.rol;
  const puedeGestionar = rol === "Administrador" || rol === "Bodeguero";

  return (
    <div className="insumos-page">
      <div className="insumos-header">
        <div className="insumos-title-wrap">
          <h2>LISTADO DE INSUMOS</h2>
          <p className="insumos-subtitle">— estado actual del almacén</p>
        </div>

        <div className="insumos-header-actions">
          {puedeGestionar && (
            <button className="insumos-addbtn secondary" onClick={handleCreateInsumo}>
              + Nuevo Insumo
            </button>
          )}

          {rol === "Administrador" && (
            <button className="insumos-addbtn" onClick={handleEntregarInsumos}>
              Entregar Insumos
            </button>
          )}

          {rol === "Bodeguero" && (
            <button className="insumos-addbtn" onClick={handleReponerInsumos}>
              Actualizar Almacén
            </button>
          )}
        </div>
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
              {puedeGestionar && <th>Acciones</th>}
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
                  {puedeGestionar && (
                    <td>
                      <div className="insumo-acciones">
                        <button
                          className="btn-insumo-editar"
                          onClick={() => handleEditInsumo(i)}
                          title="Editar insumo"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-insumo-eliminar"
                          onClick={() => handleDeleteInsumo(i)}
                          title="Eliminar insumo"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={puedeGestionar ? 6 : 5}>No hay insumos registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Insumos;