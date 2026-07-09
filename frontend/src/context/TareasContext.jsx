import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTareas, updateSubtareaEstado, deleteTarea, updateTarea } from '@services/tareas.service.js';
import { useAuth } from '@context/AuthContext.jsx';

const TareasContext = createContext();

export const TareasProvider = ({ children }) => {
  const { user }              = useAuth();
  const [tareas,  setTareas]  = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTareas = useCallback(async () => {
    if (!user) return;   // ← no fetches si no hay sesión
    setLoading(true);
    try {
      const res  = await getTareas();
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setTareas(data.map(t => ({
        ...t,
        subtareas:    Array.isArray(t.subtareas) ? t.subtareas : [],
        horaRegistro: t.hora_registro || null,
        trabajador:   t.trabajador_nombre || 'Sin asignar',
        evidenciaUrl: t.evidencia_url || null,
      })));
    } catch (err) {
      console.error('Error al obtener tareas:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);  // ← se re-ejecuta cuando cambia el usuario

  // Cuando el usuario inicia sesión → carga las tareas automáticamente
  useEffect(() => {
    if (user) {
      fetchTareas();
    } else {
      setTareas([]);  // limpia al cerrar sesión
    }
  }, [user, fetchTareas]);

  const agregarTareaLocal = (nueva) => {
    setTareas(prev => [...prev, {
      ...nueva,
      id: Date.now(), estado: 'No Realizado', horaRegistro: null, evidenciaUrl: null,
      subtareas: (nueva.subtareas || []).map((texto, i) => ({
        id: Date.now() + i + 1, texto, estado: 'No Realizado',
      })),
    }]);
  };

  const toggleSubtarea = async (tareaId, subtareaId) => {
    // Calcula nuevo estado ANTES del optimistic update
    const tareaActual = tareas.find(t => t.id === tareaId);
    const subActual   = tareaActual?.subtareas.find(s => s.id === subtareaId);
    const nuevoEstado = subActual?.estado === 'Realizado' ? 'No Realizado' : 'Realizado';

    // Optimistic update
    setTareas(prev => prev.map(t => {
      if (t.id !== tareaId) return t;
      const nuevasSub = t.subtareas.map(s =>
        s.id === subtareaId ? { ...s, estado: nuevoEstado } : s
      );
      const todasRealizadas = nuevasSub.every(s => s.estado === 'Realizado');
      return {
        ...t,
        subtareas:    nuevasSub,
        estado:       todasRealizadas ? 'Realizado' : 'No Realizado',
        horaRegistro: todasRealizadas
          ? new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
          : t.horaRegistro,
      };
    }));

    try {
      await updateSubtareaEstado(tareaId, subtareaId, nuevoEstado);
    } catch (err) {
      console.error('Error al actualizar subtarea:', err);
      fetchTareas();
    }
  };

  const totalTareas        = tareas.length;
  const tareasRealizadas   = tareas.filter(t => t.estado === 'Realizado').length;
  const tareasNoRealizadas = tareas.filter(t => t.estado === 'No Realizado').length;

  // Muestra hasta 5 actividades, priorizando realizadas primero
  const actividadReciente = [...tareas]
    .sort((a, b) => {
      if (a.estado === 'Realizado' && b.estado !== 'Realizado') return -1;
      if (b.estado === 'Realizado' && a.estado !== 'Realizado') return 1;
      return 0;
    })
    .slice(0, 5)
    .map(t => ({
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