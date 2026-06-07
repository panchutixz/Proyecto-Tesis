import { useState } from 'react';
import { registerUser } from '../services/auth.service';

const Register = () => {
  const [form, setForm] = useState({ nombre: '', apellido: '', rut: '', email: '', password: '', telefono: '', rol: 'estudiante' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // 'success' | 'error'

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await registerUser(
      form.nombre,
      form.apellido,
      form.rut,
      form.email,
      form.password,
      form.telefono,
      form.rol
    );

    if (res?.status === 201) {
      setMessage('Usuario registrado correctamente');
      setMessageType('success');
      setTimeout(() => (window.location.href = '/auth'), 1200);
    } else if (res?.data) {
     
      const msg = res.data.message || JSON.stringify(res.data);
      setMessage(msg);
      setMessageType('error');
    } else {
      setMessage('Error al conectar con el servidor');
      setMessageType('error');
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Registro de Usuario</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={form.apellido}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <input
          type="text"
          name="rut"
          placeholder="RUT (xx.xxx.xxx-x)"
          value={form.rut}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <input
          type="email"
          name="email"
          placeholder="Email (@alumnos.ubiobio.cl o @ubiobio.cl)"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono (+569XXXXXXXX)"
          value={form.telefono}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-xl"
        />
        <label htmlFor="rol" className="sr-only">Rol</label>
        <select
          id="rol"
          name="rol"
          value={form.rol}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-xl"
        >
          <option value="estudiante">Estudiante</option>
          <option value="funcionario">Funcionario</option>
          <option value="académico">Académico</option>
        </select>
        <button
          type="submit"
          disabled={loading}
         className="w-full bg-[#066380] hover:bg-[#05586f] text-white font-semibold py-3 px-6 rounded-full mt-4 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-center ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Register;
