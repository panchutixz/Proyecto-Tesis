import Swal from 'sweetalert2';
import { CreateInsumo } from '@services/insumos.service.js';

async function crearInsumoPopup() {
  const { value } = await Swal.fire({
    title: 'Nuevo Insumo',
    width: 520,
    html: `
      <style>
        .sf-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:left;margin-top:8px}
        .sf-form .full{grid-column:1/-1}
        .sf-form label{display:block;margin-bottom:5px;font-size:12px;font-weight:700;color:#5b78a2;text-transform:uppercase;letter-spacing:.5px}
        .sf-form input{width:100%;height:40px;padding:0 12px;border:1px solid #c5d3e8;border-radius:6px;background:#f4f8fc;font-size:14px;color:#1a1f5e;box-sizing:border-box}
        .sf-form input:focus{outline:none;border-color:#4a90d9;background:#fff}
      </style>
      <div class="sf-form">
        <div class="full">
          <label>Nombre del insumo</label>
          <input id="sf-nombre" placeholder="Ej: Limpiavidrios" />
        </div>
        <div>
          <label>Categoría</label>
          <input id="sf-categoria" placeholder="Ej: Limpieza general" />
        </div>
        <div>
          <label>Unidad</label>
          <input id="sf-unidad" placeholder="Ej: Litros, Rollos, Unidades" />
        </div>
        <div>
          <label>Cantidad inicial</label>
          <input id="sf-cantidad" type="number" min="0" max="9999" placeholder="0" />
        </div>
        <div>
          <label>Stock mínimo</label>
          <input id="sf-stockmin" type="number" min="0" max="9999" placeholder="10" />
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Crear Insumo',
    cancelButtonText:  'Cancelar',
    confirmButtonColor: '#1a1f5e',

    preConfirm: async () => {
      const nombre      = document.getElementById('sf-nombre').value.trim();
      const categoria   = document.getElementById('sf-categoria').value.trim();
      const unidad      = document.getElementById('sf-unidad').value.trim();
      const cantidad    = document.getElementById('sf-cantidad').value;
      const stockMinimo = document.getElementById('sf-stockmin').value;

      if (!nombre || !categoria || !unidad) {
        Swal.showValidationMessage('Completa nombre, categoría y unidad.');
        return false;
      }

      try {
        const res = await CreateInsumo({
          nombre,
          categoria,
          unidad,
          cantidad: cantidad ? Number(cantidad) : 0,
          stock_minimo: stockMinimo ? Number(stockMinimo) : 10,
        });
        return res?.data || res;
      } catch (err) {
        Swal.showValidationMessage(err.message || 'Error al crear el insumo.');
        return false;
      }
    },
  });

  return value || null;
}

export const useCreateInsumo = (fetchInsumos) => {
  const handleCreateInsumo = async () => {
    try {
      const result = await crearInsumoPopup();
      if (!result) return;

      await fetchInsumos();

      await Swal.fire({
        title: '¡Insumo creado exitosamente!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 2000,
        timerProgressBar: true,
        confirmButtonColor: '#1a1f5e',
      });
    } catch (err) {
      console.error('Error en handleCreateInsumo:', err);
    }
  };

  return { handleCreateInsumo };
};

export default useCreateInsumo;