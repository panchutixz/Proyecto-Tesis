import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import AccesoDenegado from '@components/AccesoDenegado'; 
import Profile from '@pages/profile';
import '@styles/styles.css';
import Register from '@pages/Register';
import Usuarios from '@pages/Usuarios';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Tareas from '@pages/Tareas';
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