import Swal from 'sweetalert2';
import { crearSolicitud } from '@services/solicitudInsumo.service.js';

const MIN_VALOR = 0;
const MAX_VALOR = 99;

async function nuevaSolicitudPopup(insumos, mostrarStock) {
  const { value } = await Swal.fire({
    title: 'Nueva Solicitud de Insumo',
    width: 700,
    html: `
      <style>
        .sf-form{display:grid;grid-template-columns:1fr;gap:14px;text-align:left;margin-top:8px}
        .sf-counters{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px;max-height:320px;overflow-y:auto;padding:4px}
        .sf-hint{font-size:12px;color:#a0b0c8;font-style:italic;margin-top:8px}
      </style>
      <div class="sf-form">
        <div>
          <div id="sf-counters" class="sf-counters"></div>
          <p class="sf-hint">Indica la cantidad que necesitas de cada insumo. Solo se enviará la solicitud de los insumos con cantidad mayor a 0.</p>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Enviar Solicitud',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#1a1f5e',

    didOpen: () => {
      const countersBox = document.getElementById('sf-counters');

      insumos.forEach(insumo => {
        const card = document.createElement('div');
        card.className = 'insumo-counter-card';
        card.dataset.insumoId = insumo.id;
        card.dataset.valor = '0';

        card.innerHTML = `
          <p class="insumo-counter-nombre">${insumo.nombre}</p>
          ${mostrarStock ? `<p class="insumo-counter-disponible">Disponible: ${insumo.cantidad}</p>` : ''}
          <div class="insumo-counter-row">
            <button type="button" class="insumo-counter-btn minus">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <input type="text" inputmode="numeric" maxlength="2" class="insumo-counter-valor" value="0" />
            <button type="button" class="insumo-counter-btn plus">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        `;

        const valorInput = card.querySelector('.insumo-counter-valor');
        const btnMinus   = card.querySelector('.minus');
        const btnPlus    = card.querySelector('.plus');

        const setValor = (nuevoValor) => {
          const clamped = Math.max(MIN_VALOR, Math.min(MAX_VALOR, nuevoValor));
          card.dataset.valor = clamped;
          valorInput.value = clamped;
          btnMinus.disabled = clamped <= MIN_VALOR;
          btnPlus.disabled  = clamped >= MAX_VALOR;
        };

        btnMinus.addEventListener('click', () => setValor(Number(card.dataset.valor) - 1));
        btnPlus.addEventListener('click',  () => setValor(Number(card.dataset.valor) + 1));

        valorInput.addEventListener('input', () => {
          const soloDigitos = valorInput.value.replace(/[^0-9]/g, '');
          valorInput.value = soloDigitos;
        });
        valorInput.addEventListener('blur', () => {
          const num = valorInput.value === '' ? 0 : parseInt(valorInput.value, 10);
          setValor(isNaN(num) ? 0 : num);
        });
        valorInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') valorInput.blur();
        });

        setValor(0);
        countersBox.appendChild(card);
      });
    },

    preConfirm: () => {
      const cards = [...document.querySelectorAll('#sf-counters .insumo-counter-card')];
      const items = cards
        .map(c => ({ insumo_id: Number(c.dataset.insumoId), cantidad: Number(c.dataset.valor) }))
        .filter(i => i.cantidad > 0);

      if (items.length === 0) {
        Swal.showValidationMessage('Indica al menos un insumo con cantidad mayor a 0.');
        return false;
      }

      return items;
    },
  });

  return value || null;
}

const useCrearSolicitud = (fetchSolicitudes, insumos, mostrarStock = false) => {
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

    const items = await nuevaSolicitudPopup(insumos, mostrarStock);
    if (!items) return;

    // Avisar si algún ítem pide más de lo disponible actualmente
    const sinStock = items.filter(item => {
      const insumo = insumos.find(i => i.id === item.insumo_id);
      return insumo && insumo.cantidad < item.cantidad;
    });

    if (sinStock.length > 0) {
      const listado = sinStock
        .map(item => {
          const insumo = insumos.find(i => i.id === item.insumo_id);
          return `<li>${insumo?.nombre}: pides ${item.cantidad}, disponible ${insumo?.cantidad}</li>`;
        })
        .join('');

      const confirmacion = await Swal.fire({
        title: 'Stock insuficiente en algunos insumos',
        html: `Estos insumos no tienen stock suficiente ahora mismo:<ul style="text-align:left;margin-top:8px">${listado}</ul>La solicitud quedará pendiente hasta que se abastezcan. ¿Enviar de todas formas?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, enviar igual',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#b88d00',
        cancelButtonColor: '#1a1f5e',
      });
      if (!confirmacion.isConfirmed) return;
    }

    try {
      await Promise.all(items.map(item => crearSolicitud(item)));

      await Swal.fire({
        title: items.length > 1 ? 'Solicitudes enviadas' : 'Solicitud enviada',
        text: 'Quedaron pendientes de aprobación.',
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