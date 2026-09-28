import Swal from 'sweetalert2';
import { resolverSolicitud } from '@services/solicitudInsumo.service.js';

const useResolverSolicitud = (fetchSolicitudes) => {
  const handleAprobar = async (solicitud) => {
    const confirmacion = await Swal.fire({
      title: '¿Aprobar esta solicitud?',
      html: `Se descontarán <strong>${solicitud.cantidad}</strong> unidades de <strong>${solicitud.insumo_nombre}</strong> del stock.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2f7a31',
      cancelButtonColor: '#1a1f5e',
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await resolverSolicitud(solicitud.id, 'aprobar');
      await Swal.fire({
        title: 'Solicitud aprobada',
        text: 'El stock fue descontado correctamente.',
        icon: 'success',
        confirmButtonColor: '#1a1f5e',
        timer: 2000,
        timerProgressBar: true,
      });
      await fetchSolicitudes();
    } catch (err) {
      console.error('Error al aprobar solicitud:', err);
      Swal.fire({
        title: 'No se pudo aprobar',
        text: err.response?.data?.message || err.message || 'Intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#1a1f5e',
      });
    }
  };

  const handleRechazar = async (solicitud) => {
    const { value: comentario } = await Swal.fire({
      title: 'Rechazar solicitud',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Explica brevemente por qué se rechaza esta solicitud...',
      inputAttributes: { style: 'min-height: 100px;' },
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c0392b',
      cancelButtonColor: '#1a1f5e',
      inputValidator: (value) => {
        if (!value || !value.trim()) return 'Debes indicar un motivo de rechazo.';
      },
    });

    if (!comentario) return;

    try {
      await resolverSolicitud(solicitud.id, 'rechazar', comentario.trim());
      await Swal.fire({
        title: 'Solicitud rechazada',
        icon: 'success',
        confirmButtonColor: '#1a1f5e',
        timer: 2000,
        timerProgressBar: true,
      });
      await fetchSolicitudes();
    } catch (err) {
      console.error('Error al rechazar solicitud:', err);
      Swal.fire({
        title: 'No se pudo rechazar',
        text: err.response?.data?.message || err.message || 'Intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#1a1f5e',
      });
    }
  };

  return { handleAprobar, handleRechazar };
};

export default useResolverSolicitud;