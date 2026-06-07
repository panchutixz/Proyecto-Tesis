import { Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@context/AuthContext';
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
      <main className="flex-1 p-6 overflow-auto ml-64">
        <Outlet />
      </main>
    </div>
  );
}

function Root() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}

export default Root;
