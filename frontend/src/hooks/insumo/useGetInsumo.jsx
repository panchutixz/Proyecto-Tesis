import { useState } from "react";
import { GetInsumos } from "@services/insumos.service.js";

const useGetInsumo = () => {
  const [insumos, setInsumos] = useState([]);

  const fetchInsumos = async () => {
    try {
      const response = await GetInsumos();
      setInsumos(response.data || []);
    } catch (error) {
      console.error("Error al obtener insumos:", error);
    }
  };

  return { insumos, fetchInsumos };
};

export default useGetInsumo;