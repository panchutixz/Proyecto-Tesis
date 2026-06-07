import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';
import Register from '@pages/Register';
import Usuarios from '@pages/Usuarios';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { UserProvider } from '@context/UserContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <Error404 />,
    children: [
      {
        path: '/',
        element: <Login />
      },
      {
        path: '/auth',
        element: <Login />
      },
      {
        path: '/auth/register',
        element: <Register />
      },
      {
        path: "/usuarios",
        element: (
          <ProtectedRoute allowedRoles={["admin", "guardia"]}>
            <Usuarios />
          </ProtectedRoute>
        ),
      },
      {
        path: '/home',
        element: <Home />
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <UserProvider>
    <RouterProvider router={router} />
  </UserProvider>
);
