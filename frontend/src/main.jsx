import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import AccesoDenegado from '@components/AccesoDenegado'; 
import Profile from '@pages/Profile';
import '@styles/styles.css';
import Register from '@pages/Register';
import Usuarios from '@pages/Usuarios';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { UserProvider } from '@context/UserContext';

const router = createBrowserRouter([
  {
    // ENVOLTURAS MAESTRAS EN LA RAÍZ COMPLETA
    path: '/',
    errorElement: <Error404 />, // Atrapa cualquier colapso imprevisto o error fatal de la app
    children: [
      
      // A. COMPONENTES CON SIDEBAR INCLUIDO (Hijos de Root)
      {
        path: '/',
        element: <Root />,
        children: [
          { path: '/', element: <Login /> },
          { path: '/auth', element: <Login /> },
          { path: '/auth/register', element: <Register /> },
          {
            path: "/usuarios",
            element: (
              <ProtectedRoute allowedRoles={["administrador", "supervisor", "encargado"]}>
                <Usuarios />
              </ProtectedRoute>
            ),
          },
          {
            path: '/home',
            element: (
              <ProtectedRoute> 
                <Home />
              </ProtectedRoute>
            ),
          },
        ]
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      // B. COMPONENTES INDEPENDIENTES (A Pantalla Completa sin Sidebar)
      {
        path: '/acceso-denegado',
        element: <AccesoDenegado />
      },
      // Captura cualquier otra URL loca escrita a mano a pantalla completa
      {
        path: '*',
        element: <Error404 />
      }
    ]
  }
]);

// RENDERIZADO GLOBAL
ReactDOM.createRoot(document.getElementById('root')).render(
  <UserProvider>
    <RouterProvider router={router} />
  </UserProvider>
);