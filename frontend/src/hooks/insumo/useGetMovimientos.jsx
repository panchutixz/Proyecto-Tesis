import { useState } from "react";
import { GetMovimientosInsumos } from "@services/insumos.service.js";

const useGetMovimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMovimientos = async (jornada = "Todas") => {
    setLoading(true);
    try {
      const response = await GetMovimientosInsumos(jornada);
      setMovimientos(response.data || []);
    } catch (error) {
      console.error("Error al obtener el historial de insumos:", error);
    } finally {
      setLoading(false);
    }
  };

  return { movimientos, loading, fetchMovimientos };
};

export default useGetMovimientos;