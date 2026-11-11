import { useState } from "react";
import { GetMisInsumos } from "@services/insumos.service.js";

const useGetMisInsumos = () => {
  const [misInsumos, setMisInsumos] = useState([]);
  const [loading, setLoading] = useState(false);

  // silencioso = true evita el "Cargando..." en las actualizaciones automáticas
  const fetchMisInsumos = async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    try {
      const response = await GetMisInsumos();
      setMisInsumos(response.data || []);
    } catch (error) {
      console.error("Error al obtener mis insumos:", error);
    } finally {
      if (!silencioso) setLoading(false);
    }
  };

  return { misInsumos, loading, fetchMisInsumos };
};

export default useGetMisInsumos;