import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/logoSanFrancisco2-Photoroom.png';
import cookies from 'js-cookie';
import "@styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const res = await login({ email, password });

    // login() ya guarda el usuario en sessionStorage y el token en cookie
    const stored = sessionStorage.getItem('usuario');
    const token = cookies.get('jwt-auth'); // 🔑 verificar que el token existe

    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
      navigate('/home');
    } else {
      setError(res.data?.message || 'Credenciales incorrectas');
    }
  };

  return (
    <div className="login-container flex items-center justify-center p-6">
      <div className="login-card p-10 w-full max-w-md">
        <div className="login-header">
          <div className="login-logo">
            <img src={logo} alt="logo" />
          </div>
          <h2 className="login-company">SanFrancisco</h2>
          <p className="login-subtitle">Aseo Industrial</p>
          <h1 className="login-title">Iniciar sesión</h1>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="login-input"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Iniciar sesión
          </button>
        </form>

        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
