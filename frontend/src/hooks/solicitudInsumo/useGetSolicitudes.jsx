import { useState, useCallback } from 'react';
import { getSolicitudes } from '@services/solicitudInsumo.service.js';

const useGetSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSolicitudes();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al obtener solicitudes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { solicitudes, loading, fetchSolicitudes };
};

export default useGetSolicitudes;