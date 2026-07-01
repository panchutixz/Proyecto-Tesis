import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTareas, updateSubtareaEstado } from '@services/tareas.service.js';

const TareasContext = createContext();

export const TareasProvider = ({ children }) => {
  const [tareas,  setTareas]  = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTareas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTareas();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      // Normaliza campo subtareas
      setTareas(data.map(t => ({
        ...t,
        subtareas: Array.isArray(t.subtareas) ? t.subtareas : [],
        horaRegistro: t.hora_registro || null,
        trabajador:   t.trabajador_nombre || 'sin asignar',
      })));
    } catch (err) {
      console.error('Error al obtener tareas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTareas(); }, [fetchTareas]);

  // Agrega tarea al state local (cuando el backend ya la guardó)
  const agregarTareaLocal = (nueva) => {
    setTareas(prev => [...prev, {
      ...nueva,
      id:          Date.now(),
      estado:      'No Realizado',
      horaRegistro: null,
      subtareas:   (nueva.subtareas || []).map((texto, i) => ({
        id: Date.now() + i + 1, texto, estado: 'No Realizado',
      })),
    }]);
  };

  // Toggle subtarea — llama al backend y actualiza estado local
  const toggleSubtarea = async (tareaId, subtareaId) => {
    // Optimistic update local
    setTareas(prev => prev.map(t => {
      if (t.id !== tareaId) return t;
      const nuevasSub = t.subtareas.map(s =>
        s.id === subtareaId
          ? { ...s, estado: s.estado === 'Realizado' ? 'No Realizado' : 'Realizado' }
          : s
      );
      const todasRealizadas = nuevasSub.every(s => s.estado === 'Realizado');
      return {
        ...t,
        subtareas:   nuevasSub,
        estado:      todasRealizadas ? 'Realizado' : 'No Realizado',
        horaRegistro: todasRealizadas
          ? new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
          : t.horaRegistro,
      };
    }));

    // Sincroniza con backend
    try {
      const tarea   = tareas.find(t => t.id === tareaId);
      const subtarea = tarea?.subtareas.find(s => s.id === subtareaId);
      const nuevoEstado = subtarea?.estado === 'Realizado' ? 'No Realizado' : 'Realizado';
      await updateSubtareaEstado(tareaId, subtareaId, nuevoEstado);
    } catch (err) {
      console.error('Error al actualizar subtarea:', err);
      fetchTareas(); // revert en caso de error
    }
  };

  const totalTareas        = tareas.length;
  const tareasRealizadas   = tareas.filter(t => t.estado === 'Realizado').length;
  const tareasNoRealizadas = tareas.filter(t => t.estado === 'No Realizado').length;

  const actividadReciente = tareas.slice(0, 3).map(t => ({
    id:          t.id,
    title:       t.nombre,
    description: `${t.trabajador}  |  ${t.departamento}`,
    time:        t.horaRegistro || 'Sin iniciar',
    status:      t.estado === 'Realizado' ? 'realizada' : 'pendiente',
  }));

  return (
    <TareasContext.Provider value={{
      tareas, loading, fetchTareas,
      agregarTareaLocal, toggleSubtarea,
      totalTareas, tareasRealizadas, tareasNoRealizadas,
      actividadReciente,
    }}>
      {children}
    </TareasContext.Provider>
  );
};

export const useTareas = () => {
  const ctx = useContext(TareasContext);
  if (!ctx) throw new Error('useTareas debe usarse dentro de TareasProvider');
  return ctx;
};