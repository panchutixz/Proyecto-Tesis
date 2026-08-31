import Swal from 'sweetalert2';
import { DeleteInsumo } from '@services/insumos.service.js';

export const useDeleteInsumo = (fetchInsumos) => {
  const handleDeleteInsumo = async (insumo) => {
    const result = await Swal.fire({
      title: '¿Eliminar insumo?',
      html: `Se eliminará <strong>${insumo.nombre}</strong> del catálogo.<br>Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c0392b',
      cancelButtonColor:  '#1a1f5e',
    });

    if (!result.isConfirmed) return;

    try {
      await DeleteInsumo(insumo.id);
      await fetchInsumos();
      await Swal.fire({
        title: 'Insumo eliminado',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.message || 'No se pudo eliminar el insumo.', 'error');
    }
  };

  return { handleDeleteInsumo };
};

export default useDeleteInsumo;