import Swal from 'sweetalert2';
import { deleteTarea } from '@services/tareas.service.js';

export const useDeleteTarea = (fetchTareas) => {
  const handleDeleteTarea = async (tarea) => {
    const result = await Swal.fire({
      title: '¿Eliminar tarea?',
      html: `Se eliminará <strong>${tarea.nombre}</strong> y todas sus subtareas.<br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText:  'Cancelar',
      confirmButtonColor: '#c0392b',
      cancelButtonColor:  '#1a1f5e',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteTarea(tarea.id);
      await fetchTareas();
      await Swal.fire({ title: 'Tarea eliminada', icon: 'success', timer: 1500, timerProgressBar: true, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err?.response?.data?.message || 'No se pudo eliminar la tarea.', 'error');
    }
  };

  return { handleDeleteTarea };
};

export default useDeleteTarea;