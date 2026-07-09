import Swal from 'sweetalert2';
import { updateTarea, DEPARTAMENTOS, getActividadesPorDepartamento, getSubtareasPorDepartamentoYActividad } from '@services/tareas.service.js';
import { GetUsers } from '@services/usuarios.service.js';

export const useEditTarea = (fetchTareas) => {
  const handleEditTarea = async (tarea) => {
    let usuarios = [];
    try {
      const res = await GetUsers();
      usuarios = Array.isArray(res?.data) ? res.data : [];
    } catch { usuarios = []; }

    const deptosOpts = DEPARTAMENTOS.map(d =>
      `<option value="${d}" ${d === tarea.departamento ? 'selected' : ''}>${d}</option>`
    ).join('');

    const actividadesActuales = getActividadesPorDepartamento(tarea.departamento);
    const actOpts = actividadesActuales.map(a =>
      `<option value="${a}" ${a === tarea.actividad ? 'selected' : ''}>${a}</option>`
    ).join('');

    const subsActuales = (tarea.subtareas || []).map(s => s.texto);

    const { value } = await Swal.fire({
      title: 'Editar Tarea',
      width: 640,
      html: `
        <style>
          .sf-form{display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:left;margin-top:8px}
          .sf-form .full{grid-column:1/-1}
          .sf-form label{display:block;margin-bottom:5px;font-size:12px;font-weight:700;color:#5b78a2;text-transform:uppercase;letter-spacing:.5px}
          .sf-form input,.sf-form select{width:100%;height:40px;padding:0 12px;border:1px solid #c5d3e8;border-radius:6px;background:#f4f8fc;font-size:14px;color:#1a1f5e}
          .sf-form input:focus,.sf-form select:focus{outline:none;border-color:#4a90d9;background:#fff}
          .sf-subs{display:flex;flex-direction:column;gap:6px;margin-top:6px}
          .sf-row{display:flex;gap:6px;align-items:center}
          .sf-row input{flex:1;height:36px;padding:0 10px;border:1px solid #c5d3e8;border-radius:6px;background:#f4f8fc;font-size:13px}
          .sf-rm{background:none;border:none;color:#c0392b;font-size:16px;cursor:pointer;padding:2px 6px;border-radius:4px}
          .sf-add{display:inline-flex;align-items:center;gap:6px;background:#d0e8fa;color:#4a90d9;border:1px solid #4a90d9;border-radius:6px;padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer;margin-top:4px}
        </style>
        <div class="sf-form">
          <div>
            <label>Nombre de la tarea</label>
            <input id="sf-nombre" value="${tarea.nombre || ''}"/>
          </div>
          <div>
            <label>Departamento / Lugar</label>
            <select id="sf-depto"><option value="" disabled>Seleccionar...</option>${deptosOpts}</select>
          </div>
          <div>
            <label>Actividad</label>
            <select id="sf-act">${actOpts}</select>
          </div>
          <div>
            <label>Jornada</label>
            <select id="sf-jornada">
              <option value="Mañana" ${tarea.jornada === 'Mañana' ? 'selected' : ''}>Mañana</option>
              <option value="Tarde"  ${tarea.jornada === 'Tarde'  ? 'selected' : ''}>Tarde</option>
            </select>
          </div>
          <div class="full">
            <label>Trabajador asignado</label>
            <select id="sf-trab">
              <option value="" disabled>Seleccionar...</option>
              ${usuarios.map(u =>
                `<option value="${u.id}" data-nombre="${u.nombre} ${u.apellido || ''}"
                  ${String(u.id) === String(tarea.trabajador_id) ? 'selected' : ''}>
                  ${u.nombre} ${u.apellido || ''} — ${u.jornada || ''}
                </option>`
              ).join('')}
            </select>
          </div>
          <div class="full">
            <label>Subtareas</label>
            <div id="sf-subs" class="sf-subs"></div>
            <button type="button" class="sf-add" id="sf-add">+ Añadir subtarea</button>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar cambios',
      cancelButtonText:  'Cancelar',
      confirmButtonColor: '#1a1f5e',

      didOpen: () => {
        const deptoSel = document.getElementById('sf-depto');
        const actSel   = document.getElementById('sf-act');
        const subsList = document.getElementById('sf-subs');
        const btnAdd   = document.getElementById('sf-add');

        subsActuales.forEach(t => addFila(t));

        deptoSel.addEventListener('change', () => {
          const acts = getActividadesPorDepartamento(deptoSel.value);
          actSel.innerHTML = acts.map(a => `<option value="${a}">${a}</option>`).join('');
        });

        actSel.addEventListener('change', () => {
          const subs = getSubtareasPorDepartamentoYActividad(deptoSel.value, actSel.value);
          subsList.innerHTML = '';
          subs.forEach(t => addFila(t));
        });

        btnAdd.addEventListener('click', () => addFila(''));

        function addFila(valor) {
          const row = document.createElement('div');
          row.className = 'sf-row';
          const inp = document.createElement('input');
          inp.className = 'sf-sub-input'; inp.type = 'text'; inp.value = valor;
          inp.placeholder = 'Descripción de la subtarea';
          const btn = document.createElement('button');
          btn.type = 'button'; btn.className = 'sf-rm'; btn.textContent = '✕';
          btn.onclick = () => row.remove();
          row.appendChild(inp); row.appendChild(btn);
          subsList.appendChild(row);
        }
      },

      preConfirm: async () => {
        const nombre     = document.getElementById('sf-nombre').value.trim();
        const depto      = document.getElementById('sf-depto').value;
        const actividad  = document.getElementById('sf-act').value;
        const jornada    = document.getElementById('sf-jornada').value;
        const trabSel    = document.getElementById('sf-trab');
        const trabId     = trabSel.value;
        const trabNombre = trabSel.options[trabSel.selectedIndex]?.dataset?.nombre || '';
        const subtareas  = [...document.querySelectorAll('.sf-sub-input')]
          .map(i => i.value.trim()).filter(Boolean);

        if (!nombre || !depto || !actividad || !jornada || !trabId) {
          Swal.showValidationMessage('Completa todos los campos obligatorios.');
          return false;
        }

        try {
          const res = await updateTarea(tarea.id, {
            nombre, departamento: depto, actividad, jornada,
            trabajadorId: Number(trabId),
            trabajadorNombre: trabNombre.trim(),
            subtareas,
          });
          return res?.data || res;
        } catch (err) {
          Swal.showValidationMessage(err?.response?.data?.message || err.message || 'Error al actualizar.');
          return false;
        }
      },
    });

    if (!value) return;
    await fetchTareas();
    await Swal.fire({ title: 'Tarea actualizada', icon: 'success', timer: 1800, timerProgressBar: true, showConfirmButton: false });
  };

  return { handleEditTarea };
};

export default useEditTarea;