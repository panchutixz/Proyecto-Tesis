import Swal from 'sweetalert2';
import { ReponerInsumos, GetInsumos } from '@services/insumos.service.js';

const MIN_VALOR = 0;
const MAX_VALOR = 99;

async function reponerInsumosPopup() {
  let todosLosInsumos = [];

  try {
    const resInsumos = await GetInsumos();
    todosLosInsumos = Array.isArray(resInsumos?.data) ? resInsumos.data : Array.isArray(resInsumos) ? resInsumos : [];
  } catch { todosLosInsumos = []; }

  if (todosLosInsumos.length === 0) {
    await Swal.fire({
      title: 'Sin insumos registrados',
      text: 'No hay insumos en el catálogo para actualizar.',
      icon: 'info',
      confirmButtonColor: '#1a1f5e',
    });
    return null;
  }

  const { value } = await Swal.fire({
    title: 'Actualizar Almacén',
    width: 700,
    html: `
      <style>
        .sf-form{display:grid;grid-template-columns:1fr;gap:14px;text-align:left;margin-top:8px}
        .sf-counters{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px;max-height:320px;overflow-y:auto;padding:4px}
        .sf-hint{font-size:12px;color:#a0b0c8;font-style:italic;margin-top:8px}
        .sf-info{background:#eef4fb;border:1px solid #d0e8fa;border-radius:6px;padding:10px 14px;font-size:13px;color:#1a1f5e;margin-bottom:4px}
      </style>
      <div class="sf-form">
        <p class="sf-info">Indica cuántas unidades deseas <strong>agregar</strong> al stock actual de cada insumo.</p>
        <div>
          <label style="display:block;margin-bottom:5px;font-size:12px;font-weight:700;color:#5b78a2;text-transform:uppercase;letter-spacing:.5px">
            Cantidad a agregar al almacén
          </label>
          <div id="sf-counters" class="sf-counters"></div>
          <p class="sf-hint">Cada insumo permite agregar entre 0 y 99 unidades por actualización.</p>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Actualizar Almacén',
    cancelButtonText:  'Cancelar',
    confirmButtonColor: '#1a1f5e',

    didOpen: () => {
      const countersBox = document.getElementById('sf-counters');

      todosLosInsumos.forEach(insumo => {
        const card = document.createElement('div');
        card.className = 'insumo-counter-card';
        card.dataset.insumoId = insumo.id;
        card.dataset.valor = '0';

        card.innerHTML = `
          <p class="insumo-counter-nombre">${insumo.nombre}</p>
          <p class="insumo-counter-disponible">Disponible: ${insumo.cantidad}</p>
          <div class="insumo-counter-row">
            <button type="button" class="insumo-counter-btn minus">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span class="insumo-counter-valor">0</span>
            <button type="button" class="insumo-counter-btn plus">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        `;

        const valorSpan = card.querySelector('.insumo-counter-valor');
        const btnMinus  = card.querySelector('.minus');
        const btnPlus   = card.querySelector('.plus');

        const actualizar = () => {
          const valor = Number(card.dataset.valor);
          valorSpan.textContent = valor;
          btnMinus.disabled = valor <= MIN_VALOR;
          btnPlus.disabled  = valor >= MAX_VALOR;
        };

        btnMinus.addEventListener('click', () => {
          const valor = Number(card.dataset.valor);
          if (valor > MIN_VALOR) { card.dataset.valor = valor - 1; actualizar(); }
        });

        btnPlus.addEventListener('click', () => {
          const valor = Number(card.dataset.valor);
          if (valor < MAX_VALOR) { card.dataset.valor = valor + 1; actualizar(); }
        });

        actualizar();
        countersBox.appendChild(card);
      });
    },

    preConfirm: async () => {
      const cards = [...document.querySelectorAll('#sf-counters .insumo-counter-card')];
      const items = cards
        .map(c => ({ insumoId: Number(c.dataset.insumoId), cantidad: Number(c.dataset.valor) }))
        .filter(i => i.cantidad > 0);

      if (items.length === 0) {
        Swal.showValidationMessage('Indica al menos un insumo con cantidad mayor a 0.');
        return false;
      }

      try {
        const res = await ReponerInsumos({ items });
        return res?.data || res;
      } catch (err) {
        Swal.showValidationMessage(err.message || 'Error al actualizar el almacén.');
        return false;
      }
    },
  });

  return value || null;
}

export const useReponerInsumos = (fetchInsumos) => {
  const handleReponerInsumos = async () => {
    try {
      const result = await reponerInsumosPopup();
      if (!result) return;

      await fetchInsumos();

      await Swal.fire({
        title: '¡Almacén actualizado exitosamente!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 2000,
        timerProgressBar: true,
        confirmButtonColor: '#1a1f5e',
      });
    } catch (err) {
      console.error('Error en handleReponerInsumos:', err);
    }
  };

  return { handleReponerInsumos };
};

export default useReponerInsumos;