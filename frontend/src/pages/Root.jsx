import { Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { TareasProvider } from '@context/TareasContext';   // ← agrega este import
import Sidebar from '@components/Sidebar';

function RootContent() {
  const { user } = useAuth();
  const location = useLocation();

  const publicRoutes = ["/", "/auth", "/auth/register", "/login"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (!user || isPublicRoute) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-4 pt-16 md:p-6 md:pt-6 overflow-auto ml-0 md:ml-64 w-full">
        <Outlet />
      </main>
    </div>
  );
}

function Root() {
  return (
    <AuthProvider>
      <TareasProvider>       {/* ← agrega este wrapper */}
        <RootContent />
      </TareasProvider>      {/* ← cierra aquí */}
    </AuthProvider>
  );
}

export default Root;