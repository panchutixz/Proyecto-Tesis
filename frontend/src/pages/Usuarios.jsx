import "@styles/usuarios.css";
import useGetUser from "@hooks/usuario/useGetUser.jsx";
import useDeleteUser from "@hooks/usuario/useDeleteUser.jsx";
import useCreateUser from "@hooks/usuario/useCreateUser.jsx";       // Hook para Administrador
import useEditUser from "@hooks/usuario/useEditUser.jsx";           // Hook para Administrador
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const rolColors = {
  administrador: '#0d47a1',   // azul oscuro
  supervisor: '#0288d1',         // celeste/azul
  encargado: '#2e7d32',      // verde
  empleado: '#e65100',     // naranjo fuerte
  bodeguero: '#6a1b9a'        // púrpura
};

function rolStyle(rol) {
  const color = rolColors[rol?.toLowerCase().trim()] || '#6c757d';
  return {
    backgroundColor: color,
    color: '#fff',
    padding: '4px 8px',
    borderRadius: 12,
    display: 'inline-block',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  };
}

const Users = () => {
  const { user: authUser } = useAuth();
  const { users, fetchUsers } = useGetUser();
  const { handleDeleteUser } = useDeleteUser(fetchUsers);
  const { handleCreateUser } = useCreateUser(fetchUsers);          // Admin
  const { handleEditUser } = useEditUser(fetchUsers);              // Admin


  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="users-page">
      <div className="users-header">
        <h2>Lista de Usuarios</h2>
        {authUser?.rol === 'Administrador' && (
          <button className="users-addbtn">
            Añadir Usuario
          </button>
        )}
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Rut</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.rut}</td>
                <td>{u.nombre}</td>
                <td>{u.apellido}</td>
                <td>{u.email}</td>
                <td>
                  <span style={rolStyle(u.rol)}>
                    {u.rol}
                  </span>
                </td>
                <td>{u.telefono}</td>
                <td>
                  <button className="delete">
                    Eliminar
                  </button>
                  {authUser?.rol === 'Administrador' && (
                    <button
                      className="edit"
                      style={{ marginLeft: "8px" }}
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No hay usuarios disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
