import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/login';
import Home from '@pages/home';
import Error404 from '@pages/error404';
import Root from '@pages/root';
import ProtectedRoute from '@components/ProtectedRoute';
import AccesoDenegado from '@components/AccesoDenegado'; 
import Profile from '@pages/profile';
import '@styles/styles.css';
import Register from '@pages/register';
import Usuarios from '@pages/usuarios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Tareas from '@pages/tareas';
import {TareasProvider} from '@context/TareasContext';

import { UserProvider } from '@context/UserContext';

const router = createBrowserRouter([
  {
   
    path: '/',
    errorElement: <Error404 />, 
    children: [
      
      
      {
        path: '/', 
        element: <Root />,
        children: [
       
          { index: true, element: <Login /> }, 
          { path: 'auth', element: <Login /> },
          { path: 'auth/register', element: <Register /> },
          
          
          {
            path: "usuarios",
            element: (
              <ProtectedRoute allowedRoles={["administrador", "supervisor", "encargado"]}>
                <Usuarios />
              </ProtectedRoute>
            ),
          },
          {
            path: 'home',
            element: (
              <ProtectedRoute> 
                <Home />
              </ProtectedRoute>
            ),
          },
          {
            path: 'profile',
            element: (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            ),
          },
          {
            path: 'tareas',
            element: (
              <ProtectedRoute>
                <Tareas />
              </ProtectedRoute>
            ),
          },
        ]
      },

      
      {
        path: 'acceso-denegado',
        element: <AccesoDenegado />
      },
      
      {
        path: '*',
        element: <Error404 />
      }
    ]
  }
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <UserProvider>
    <RouterProvider router={router} />
  </UserProvider>
);