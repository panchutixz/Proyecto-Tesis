import Swal from 'sweetalert2';
import { UpdateInsumo } from '@services/insumos.service.js';
import { CATEGORIAS_INSUMO, UNIDADES_INSUMO } from './insumoCatalogos.js';

async function editarInsumoPopup(insumo) {
  const categoriaOpts = CATEGORIAS_INSUMO.map(c =>
    `<option value="${c}" ${c === insumo.categoria ? 'selected' : ''}>${c}</option>`
  ).join('');
  const unidadOpts = UNIDADES_INSUMO.map(u =>
    `<option value="${u}" ${u === insumo.unidad ? 'selected' : ''}>${u}</option>`
  ).join('');

  const { value } = await Swal.fire({
    title: 'Editar Insumo',
    width: 520,
    html: `
      <style>
        .sf-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:left;margin-top:8px}
        .sf-form .full{grid-column:1/-1}
        .sf-form label{display:block;margin-bottom:5px;font-size:12px;font-weight:700;color:#5b78a2;text-transform:uppercase;letter-spacing:.5px}
        .sf-form input,.sf-form select{width:100%;height:40px;padding:0 12px;border:1px solid #c5d3e8;border-radius:6px;background:#f4f8fc;font-size:14px;color:#1a1f5e;box-sizing:border-box}
        .sf-form input:focus,.sf-form select:focus{outline:none;border-color:#4a90d9;background:#fff}
      </style>
      <div class="sf-form">
        <div class="full">
          <label>Nombre del insumo</label>
          <input id="sf-nombre" value="${insumo.nombre}" />
        </div>
        <div>
          <label>Categoría</label>
          <select id="sf-categoria">${categoriaOpts}</select>
        </div>
        <div>
          <label>Unidad</label>
          <select id="sf-unidad">${unidadOpts}</select>
        </div>
        <div>
          <label>Cantidad actual</label>
          <input id="sf-cantidad" type="number" min="0" max="9999" value="${insumo.cantidad}" />
        </div>
        <div>
          <label>Stock mínimo</label>
          <input id="sf-stockmin" type="number" min="0" max="9999" value="${insumo.stock_minimo}" />
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar Cambios',
    cancelButtonText:  'Cancelar',
    confirmButtonColor: '#1a1f5e',

    preConfirm: async () => {
      const nombre      = document.getElementById('sf-nombre').value.trim();
      const categoria   = document.getElementById('sf-categoria').value;
      const unidad      = document.getElementById('sf-unidad').value;
      const cantidad    = document.getElementById('sf-cantidad').value;
      const stockMinimo = document.getElementById('sf-stockmin').value;

      if (!nombre || !categoria || !unidad) {
        Swal.showValidationMessage('Completa nombre, categoría y unidad.');
        return false;
      }

      try {
        const res = await UpdateInsumo(insumo.id, {
          nombre,
          categoria,
          unidad,
          cantidad: Number(cantidad),
          stock_minimo: Number(stockMinimo),
        });
        return res?.data || res;
      } catch (err) {
        Swal.showValidationMessage(err.message || 'Error al actualizar el insumo.');
        return false;
      }
    },
  });

  return value || null;
}

export const useEditInsumo = (fetchInsumos) => {
  const handleEditInsumo = async (insumo) => {
    try {
      const result = await editarInsumoPopup(insumo);
      if (!result) return;

      await fetchInsumos();

      await Swal.fire({
        title: 'Insumo actualizado',
        icon: 'success',
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('Error en handleEditInsumo:', err);
    }
  };

  return { handleEditInsumo };
};

export default useEditInsumo;