import Swal from 'sweetalert2';
import { crearSolicitud } from '@services/solicitudInsumo.service.js';

const useCrearSolicitud = (fetchSolicitudes, insumos) => {
  const handleCrearSolicitud = async () => {
    if (!insumos || insumos.length === 0) {
      Swal.fire({
        title: 'Sin insumos disponibles',
        text: 'Aún no hay insumos registrados en el catálogo.',
        icon: 'info',
        confirmButtonColor: '#1a1f5e',
      });
      return;
    }

    const opcionesInsumo = insumos
      .map(i => `<option value="${i.id}">${i.nombre} (${i.unidad}) — stock: ${i.cantidad}</option>`)
      .join('');

    const { value: formValues } = await Swal.fire({
      title: 'Nueva Solicitud de Insumo',
      width: 500,
      html: `
        <style>
          .sf-form{display:grid;grid-template-columns:1fr;gap:14px;text-align:left;margin-top:8px}
          .sf-form label{display:block;margin-bottom:5px;font-size:12px;font-weight:700;color:#5b78a2;text-transform:uppercase;letter-spacing:.5px}
          .sf-form input,.sf-form select{width:100%;height:40px;padding:0 12px;border:1px solid #c5d3e8;border-radius:6px;background:#f4f8fc;font-size:14px;color:#1a1f5e;box-sizing:border-box;appearance:none;-webkit-appearance:none}
          .sf-form input:focus,.sf-form select:focus{outline:none;border-color:#4a90d9;background:#fff}
          .sf-form select{
            background-image: linear-gradient(45deg, transparent 50%, #5b78a2 50%), linear-gradient(135deg, #5b78a2 50%, transparent 50%);
            background-position: calc(100% - 18px) calc(50% - 3px), calc(100% - 12px) calc(50% - 3px);
            background-size: 6px 6px, 6px 6px;
            background-repeat: no-repeat;
            cursor: pointer;
          }
        </style>
        <div class="sf-form">
          <div>
            <label for="swal2-insumo">Insumo</label>
            <select id="swal2-insumo">
              <option value="" disabled selected>Seleccionar...</option>
              ${opcionesInsumo}
            </select>
          </div>
          <div>
            <label for="swal2-cantidad">Cantidad solicitada</label>
            <input id="swal2-cantidad" type="number" min="1" placeholder="Ej: 5" />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Enviar Solicitud',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#1a1f5e',
      preConfirm: () => {
        const insumo_id = document.getElementById('swal2-insumo').value;
        const cantidad  = Number(document.getElementById('swal2-cantidad').value);

        if (!insumo_id || !cantidad || cantidad <= 0) {
          Swal.showValidationMessage('Debes seleccionar un insumo e indicar una cantidad válida.');
          return false;
        }

        return { insumo_id: Number(insumo_id), cantidad };
      },
    });

    if (!formValues) return;

    try {
      await crearSolicitud(formValues);
      await Swal.fire({
        title: 'Solicitud enviada',
        text: 'Tu solicitud fue enviada correctamente y quedó pendiente de aprobación.',
        icon: 'success',
        confirmButtonColor: '#1a1f5e',
        timer: 2000,
        timerProgressBar: true,
      });
      await fetchSolicitudes();
    } catch (err) {
      console.error('Error al crear solicitud:', err);
      Swal.fire({
        title: 'Error al enviar la solicitud',
        text: err.response?.data?.message || err.message || 'Intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#1a1f5e',
      });
    }
  };

  return { handleCrearSolicitud };
};

export default useCrearSolicitud;