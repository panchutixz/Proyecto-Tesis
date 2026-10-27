import Swal from 'sweetalert2';

export const MOTIVOS_ASISTENCIA = [
  'Licencia médica',
  'Permiso administrativo',
  'Vacaciones',
  'Falta sin aviso',
  'Otro',
];

// Abre el cuadro "Dejar observación".
// Devuelve { motivo, comentario } al guardar, { motivo: '', comentario: '' } al quitarla
// o null si se cancela.
export async function observacionPopup(fila, jornada) {
  let motivoSel = fila.motivo || '';

  const result = await Swal.fire({
    title: 'Dejar observación',
    width: 480,
    html: `
      <style>
        .asist-obs{text-align:left}
        .asist-obs-sub{margin:0 0 14px;text-align:center;font-size:13px;font-style:italic;color:#6b7cb0}
        .asist-obs label{display:block;margin:12px 0 6px;font-size:12px;font-weight:700;color:#5b78a2;text-transform:uppercase;letter-spacing:.5px}
        .asist-obs-chips{display:flex;flex-wrap:wrap;gap:8px}
        .asist-obs-chip{padding:7px 14px;border-radius:20px;border:1px solid #c5d3e8;background:#fff;color:#6b7cb0;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s,color .15s,border-color .15s}
        .asist-obs-chip.active{background:#1a1f5e;color:#fff;border-color:#1a1f5e}
        .asist-obs textarea{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #c5d3e8;border-radius:6px;background:#f4f8fc;font-size:14px;color:#1a1f5e;resize:vertical;font-family:inherit}
        .asist-obs textarea:focus{outline:none;border-color:#4a90d9;background:#fff}
        .asist-obs-hint{margin:8px 0 0;font-size:12px;font-style:italic;color:#a0b0c8}
      </style>
      <div class="asist-obs">
        <p class="asist-obs-sub" id="asist-obs-sub"></p>
        <label>Motivo</label>
        <div class="asist-obs-chips" id="asist-obs-chips"></div>
        <label for="asist-obs-coment">Comentario (opcional)</label>
        <textarea id="asist-obs-coment" rows="3" maxlength="200" placeholder="Ej: presenta licencia hasta el viernes"></textarea>
        <p class="asist-obs-hint">Queda asociada al registro de asistencia de esta jornada.</p>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    showDenyButton: Boolean(fila.motivo || fila.comentario),
    confirmButtonText: 'Guardar observación',
    denyButtonText: 'Quitar observación',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#1a1f5e',
    denyButtonColor: '#c0392b',

    didOpen: () => {
      // Se usa textContent para no interpretar como HTML el nombre del trabajador
      document.getElementById('asist-obs-sub').textContent =
        `${fila.nombre} ${fila.apellido || ''} — Jornada ${jornada}`;

      const chipsBox = document.getElementById('asist-obs-chips');
      MOTIVOS_ASISTENCIA.forEach((m) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'asist-obs-chip' + (m === motivoSel ? ' active' : '');
        chip.textContent = m;
        chip.addEventListener('click', () => {
          motivoSel = m;
          chipsBox.querySelectorAll('.asist-obs-chip').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');
        });
        chipsBox.appendChild(chip);
      });

      document.getElementById('asist-obs-coment').value = fila.comentario || '';
    },

    preConfirm: () => {
      const comentario = document.getElementById('asist-obs-coment').value.trim();
      if (!motivoSel && !comentario) {
        Swal.showValidationMessage('Elige un motivo o escribe un comentario.');
        return false;
      }
      return { motivo: motivoSel || 'Otro', comentario };
    },
  });

  if (result.isConfirmed) return result.value;
  if (result.isDenied) return { motivo: '', comentario: '' };
  return null;
}