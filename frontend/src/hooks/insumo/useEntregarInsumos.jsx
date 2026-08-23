import Swal from 'sweetalert2';
import { EntregarInsumos, GetInsumos } from '@services/insumos.service.js';
import { GetUsers } from '@services/usuarios.service.js';

const MIN_VALOR = 0;
const MAX_VALOR = 99;

async function entregarInsumosPopup() {
  let todosLosUsuarios = [];
  let todosLosInsumos = [];

  try {
    const resUsers = await GetUsers();
    todosLosUsuarios = Array.isArray(resUsers?.data) ? resUsers.data : Array.isArray(resUsers) ? resUsers : [];
  } catch { todosLosUsuarios = []; }

  try {
    const resInsumos = await GetInsumos();
    todosLosInsumos = Array.isArray(resInsumos?.data) ? resInsumos.data : Array.isArray(resInsumos) ? resInsumos : [];
  } catch { todosLosInsumos = []; }

  if (todosLosInsumos.length === 0) {
    await Swal.fire({
      title: 'Sin insumos registrados',
      text: 'No hay insumos en el almacén para entregar.',
      icon: 'info',
      confirmButtonColor: '#1a1f5e',
    });
    return null;
  }

  const { value } = await Swal.fire({
    title: 'Entregar Insumos',
    width: 700,
    html: `
      <style>
        .sf-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:left;margin-top:8px}
        .sf-form .full{grid-column:1/-1}
        .sf-form label{display:block;margin-bottom:5px;font-size:12px;font-weight:700;color:#5b78a2;text-transform:uppercase;letter-spacing:.5px}
        .sf-form select{width:100%;height:40px;padding:0 12px;border:1px solid #c5d3e8;border-radius:6px;background:#f4f8fc;font-size:14px;color:#1a1f5e}
        .sf-form select:focus{outline:none;border-color:#4a90d9;background:#fff}
        .sf-counters{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px;max-height:280px;overflow-y:auto;padding:4px}
        .sf-hint{font-size:12px;color:#a0b0c8;font-style:italic;margin-top:8px}
      </style>
      <div class="sf-form">
        <div>
          <label>Jornada</label>
          <select id="sf-jornada">
            <option value="" disabled selected>Seleccionar...</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
          </select>
        </div>
        <div>
          <label>Trabajador asignado</label>
          <select id="sf-trab" disabled><option value="" disabled selected>Selecciona una jornada primero</option></select>
        </div>
        <div class="full">
          <label>Cantidad a entregar por insumo</label>
          <div id="sf-counters" class="sf-counters"></div>
          <p class="sf-hint">Cada insumo permite entre 0 y 99 unidades. Solo se entregarán los insumos con cantidad mayor a 0.</p>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Confirmar Entrega',
    cancelButtonText:  'Cancelar',
    confirmButtonColor: '#1a1f5e',

    didOpen: () => {
      const jorSel      = document.getElementById('sf-jornada');
      const trabSel     = document.getElementById('sf-trab');
      const countersBox = document.getElementById('sf-counters');

      // Jornada → filtra trabajadores (mismo patrón que Asignar Tarea)
      jorSel.addEventListener('change', () => {
        const jornada   = jorSel.value;
        const filtrados = todosLosUsuarios.filter(u =>
          u.jornada?.toLowerCase() === jornada.toLowerCase() &&
          u.rol?.toLowerCase() === 'empleado'
        );
        trabSel.innerHTML = filtrados.length
          ? '<option value="" disabled selected>Seleccionar trabajador...</option>' +
            filtrados.map(u => `<option value="${u.id}" data-nombre="${u.nombre} ${u.apellido||''}">${u.nombre} ${u.apellido||''} — ${u.jornada}</option>`).join('')
          : '<option value="" disabled selected>No hay trabajadores en esta jornada</option>';
        trabSel.disabled = filtrados.length === 0;
      });

      // Renderiza un contador por cada insumo del almacén
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
        const maxDisponible = Math.min(MAX_VALOR, Number(insumo.cantidad));

        const actualizar = () => {
          const valor = Number(card.dataset.valor);
          valorSpan.textContent = valor;
          btnMinus.disabled = valor <= MIN_VALOR;
          btnPlus.disabled  = valor >= maxDisponible;
        };

        btnMinus.addEventListener('click', () => {
          const valor = Number(card.dataset.valor);
          if (valor > MIN_VALOR) { card.dataset.valor = valor - 1; actualizar(); }
        });

        btnPlus.addEventListener('click', () => {
          const valor = Number(card.dataset.valor);
          if (valor < maxDisponible) { card.dataset.valor = valor + 1; actualizar(); }
        });

        actualizar();
        countersBox.appendChild(card);
      });
    },

    preConfirm: async () => {
      const jornada   = document.getElementById('sf-jornada').value;
      const trabSel   = document.getElementById('sf-trab');
      const trabId    = trabSel.value;
      const trabNombre = trabSel.options[trabSel.selectedIndex]?.dataset?.nombre || '';

      if (!jornada || !trabId) {
        Swal.showValidationMessage('Selecciona la jornada y el trabajador.');
        return false;
      }

      const cards = [...document.querySelectorAll('#sf-counters .insumo-counter-card')];
      const items = cards
        .map(c => ({ insumoId: Number(c.dataset.insumoId), cantidad: Number(c.dataset.valor) }))
        .filter(i => i.cantidad > 0);

      if (items.length === 0) {
        Swal.showValidationMessage('Indica al menos un insumo con cantidad mayor a 0.');
        return false;
      }

      try {
        const res = await EntregarInsumos({
          trabajadorId: Number(trabId),
          trabajadorNombre: trabNombre.trim(),
          jornada,
          items,
        });
        return res?.data || res;
      } catch (err) {
        Swal.showValidationMessage(err.message || 'Error al entregar los insumos.');
        return false;
      }
    },
  });

  return value || null;
}

export const useEntregarInsumos = (fetchInsumos) => {
  const handleEntregarInsumos = async () => {
    try {
      const result = await entregarInsumosPopup();
      if (!result) return;

      await fetchInsumos();

      await Swal.fire({
        title: '¡Insumos entregados exitosamente!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        timer: 2000,
        timerProgressBar: true,
        confirmButtonColor: '#1a1f5e',
      });
    } catch (err) {
      console.error('Error en handleEntregarInsumos:', err);
    }
  };

  return { handleEntregarInsumos };
};

export default useEntregarInsumos;