import { useState, useEffect, useCallback, useMemo } from 'react';
import { GetUsers } from '@services/usuarios.service.js';
import { GetAsistencia, GuardarAsistencia } from '@services/asistencia.service.js';
import { showErrorAlert, showSuccessAlert } from '@helpers/sweetAlert.js';
import { observacionPopup } from '@hooks/asistencia/observacionPopup.js';

const useAsistencia = () => {
  const [jornada, setJornada] = useState('Mañana');
  const [trabajadores, setTrabajadores] = useState([]); // todos los usuarios
  const [filas, setFilas] = useState([]);               // lista que se está pasando
  const [guardado, setGuardado] = useState(null);       // asistencia ya guardada hoy (o null)
  const [dirty, setDirty] = useState(false);            // hay cambios sin guardar
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Usuarios (una sola vez)
  useEffect(() => {
    (async () => {
      try {
        const res = await GetUsers();
        setTrabajadores(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
      } catch (error) {
        console.error('Error al obtener los trabajadores:', error);
      }
    })();
  }, []);

  // Empleados de la jornada seleccionada (mismo criterio que Entregar Insumos)
  const empleadosJornada = useMemo(
    () =>
      trabajadores
        .filter(
          (u) =>
            u.rol?.toLowerCase() === 'empleado' &&
            u.jornada?.toLowerCase() === jornada.toLowerCase()
        )
        .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, 'es')),
    [trabajadores, jornada]
  );

  // Carga la asistencia guardada hoy y arma la lista de la jornada
  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetAsistencia(jornada);
      const resumen = res?.data || null;
      const porTrabajador = new Map((resumen?.registros || []).map((r) => [r.trabajador_id, r]));

      setFilas(
        empleadosJornada.map((u) => {
          const reg = porTrabajador.get(u.id);
          return {
            id: u.id,
            nombre: u.nombre,
            apellido: u.apellido || '',
            presente: reg ? reg.presente : false,
            motivo: reg?.motivo || '',
            comentario: reg?.comentario || '',
          };
        })
      );
      setGuardado(resumen?.guardado ? resumen : null);
      setDirty(false);
    } catch (error) {
      console.error('Error al obtener la asistencia:', error);
      showErrorAlert('Error', error.message || 'No se pudo cargar la asistencia.');
    } finally {
      setLoading(false);
    }
  }, [jornada, empleadosJornada]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const togglePresente = (id) => {
    setFilas((prev) => prev.map((f) => (f.id === id ? { ...f, presente: !f.presente } : f)));
    setDirty(true);
  };

  const marcarTodosPresentes = () => {
    setFilas((prev) => prev.map((f) => ({ ...f, presente: true })));
    setDirty(true);
  };

  const dejarObservacion = async (fila) => {
    const obs = await observacionPopup(fila, jornada);
    if (!obs) return;
    setFilas((prev) =>
      prev.map((f) => (f.id === fila.id ? { ...f, motivo: obs.motivo, comentario: obs.comentario } : f))
    );
    setDirty(true);
  };

  const guardarAsistencia = async () => {
    if (filas.length === 0) return;
    setSaving(true);
    try {
      const res = await GuardarAsistencia({
        jornada,
        registros: filas.map((f) => ({
          trabajadorId: f.id,
          presente: f.presente,
          motivo: f.motivo,
          comentario: f.comentario,
        })),
      });
      setGuardado(res?.data || null);
      setDirty(false);
      showSuccessAlert('¡Asistencia guardada!', res?.message);
    } catch (error) {
      showErrorAlert('Error', error.message || 'No se pudo guardar la asistencia.');
    } finally {
      setSaving(false);
    }
  };

  const resumen = useMemo(() => {
    const presentes = filas.filter((f) => f.presente).length;
    return {
      total: filas.length,
      presentes,
      ausentes: filas.length - presentes,
      conObservacion: filas.filter((f) => f.motivo || f.comentario).length,
    };
  }, [filas]);

  return {
    jornada,
    setJornada,
    filas,
    guardado,
    dirty,
    loading,
    saving,
    resumen,
    togglePresente,
    marcarTodosPresentes,
    dejarObservacion,
    guardarAsistencia,
  };
};

export default useAsistencia;