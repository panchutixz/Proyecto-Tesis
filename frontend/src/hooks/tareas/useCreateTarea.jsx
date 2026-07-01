import Swal from 'sweetalert2';
import { createTarea, DEPARTAMENTOS, getActividadesPorDepartamento, getSubtareasPorDepartamentoYActividad } from '@services/tareas.service.js';
import { GetUsers } from '@services/usuarios.service.js';

async function asignarTareaPopup() {
  let todosLosUsuarios = [];
  try {
    const res = await GetUsers();
    todosLosUsuarios = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  } catch { todosLosUsuarios = []; }

  const deptosOpts = DEPARTAMENTOS.map(d => `<option value="${d}">${d}</option>`).join('');

  const { value } = await Swal.fire({
    title: 'Asignar Tarea',
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
        .sf-ph{font-size:13px;color:#a0b0c8;font-style:italic}
      </style>
      <div class="sf-form">
        <div>
          <label>Nombre de la tarea</label>
          <input id="sf-nombre" placeholder="Ej: Limpiar Baños FACE"/>
        </div>
        <div>
          <label>Departamento / Lugar</label>
          <select id="sf-depto"><option value="" disabled selected>Seleccionar...</option>${deptosOpts}</select>
        </div>
        <div>
          <label>Actividad</label>
          <select id="sf-act" disabled><option value="" disabled selected>Selecciona un departamento primero</option></select>
        </div>
        <div>
          <label>Jornada</label>
          <select id="sf-jornada">
            <option value="" disabled selected>Seleccionar...</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
          </select>
        </div>
        <div class="full">
          <label>Trabajador asignado</label>
          <select id="sf-trab" disabled><option value="" disabled selected>Selecciona una jornada primero</option></select>
        </div>
        <div class="full">
          <label>Subtareas</label>
          <div id="sf-subs" class="sf-subs">
            <p id="sf-ph" class="sf-ph">Las subtareas se rellenan automáticamente al seleccionar departamento y actividad.</p>
          </div>
          <button type="button" class="sf-add" id="sf-add">+ Añadir subtarea</button>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Asignar Tarea',
    cancelButtonText:  'Cancelar',
    confirmButtonColor: '#1a1f5e',

    didOpen: () => {
      const deptoSel  = document.getElementById('sf-depto');
      const actSel    = document.getElementById('sf-act');
      const jorSel    = document.getElementById('sf-jornada');
      const trabSel   = document.getElementById('sf-trab');
      const subsList  = document.getElementById('sf-subs');
      const ph        = document.getElementById('sf-ph');
      const btnAdd    = document.getElementById('sf-add');

      // Departamento → rellena actividades
      deptoSel.addEventListener('change', () => {
        const depto = deptoSel.value;
        actSel.innerHTML = '<option value="" disabled selected>Seleccionar actividad...</option>' +
          getActividadesPorDepartamento(depto).map(a => `<option value="${a}">${a}</option>`).join('');
        actSel.disabled = false;
        rellenarSubs([]);
      });

      // Actividad → rellena subtareas automáticamente
      actSel.addEventListener('change', () => {
        const subs = getSubtareasPorDepartamentoYActividad(deptoSel.value, actSel.value);
        rellenarSubs(subs);
      });

      // Jornada → filtra trabajadores
      jorSel.addEventListener('change', () => {
        const jornada   = jorSel.value;
        const filtrados = todosLosUsuarios.filter(u =>
          u.jornada?.toLowerCase() === jornada.toLowerCase()
        );
        trabSel.innerHTML = filtrados.length
          ? '<option value="" disabled selected>Seleccionar trabajador...</option>' +
            filtrados.map(u => `<option value="${u.id}" data-nombre="${u.nombre} ${u.apellido||''}">${u.nombre} ${u.apellido||''} — ${u.jornada}</option>`).join('')
          : '<option value="" disabled selected>No hay trabajadores en esta jornada</option>';
        trabSel.disabled = filtrados.length === 0;
      });

      // Añadir subtarea manual
      btnAdd.addEventListener('click', () => addFila(''));

      function rellenarSubs(lista) {
        subsList.innerHTML = '';
        if (!lista.length) { subsList.appendChild(ph); ph.style.display = 'block'; return; }
        ph.style.display = 'none';
        lista.forEach(t => addFila(t));
      }

      function addFila(valor) {
        ph.style.display = 'none';
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
      const nombre    = document.getElementById('sf-nombre').value.trim();
      const depto     = document.getElementById('sf-depto').value;
      const actividad = document.getElementById('sf-act').value;
      const jornada   = document.getElementById('sf-jornada').value;
      const trabSel   = document.getElementById('sf-trab');
      const trabId    = trabSel.value;
      const trabNombre = trabSel.options[trabSel.selectedIndex]?.dataset?.nombre || '';
      const subtareas  = [...document.querySelectorAll('.sf-sub-input')]
        .map(i => i.value.trim()).filter(Boolean);

      if (!nombre || !depto || !actividad || !jornada || !trabId) {
        Swal.showValidationMessage('Completa todos los campos obligatorios.');
        return false;
      }

      try {
        const res = await createTarea({
          nombre, 
          departamento: depto,
          actividad,
          jornada,
          trabajadorId: Number(trabId),
          trabajadorNombre: trabNombre.trim(),
          subtareas,
        });
        return res?.data || res;
      } catch (err) {
        Swal.showValidationMessage(err.message || 'Error al crear la tarea.');
        return false;
      }
    },
  });

  return value || null;
}

export const useCreateTarea = (fetchTareas, agregarTareaLocal) => {
  const handleCreateTarea = async () => {
    try {
      const result = await asignarTareaPopup();
      if (!result) return;

      // Si el backend devolvió la tarea con id, recargamos; si no, la agregamos local
      if (result?.id) {
        await fetchTareas();
      } else {
        agregarTareaLocal(result);
      }

      await Swal.fire({
        title: '¡Tarea asignada exitosamente!',
        icon:  'success',
        confirmButtonText: 'Aceptar',
        timer: 2000,
        timerProgressBar: true,
        confirmButtonColor: '#1a1f5e',
      });
    } catch (err) {
      console.error('Error en handleCreateTarea:', err);
    }
  };
  return { handleCreateTarea };
};

export default useCreateTarea;