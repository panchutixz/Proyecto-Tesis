import "@styles/usuarios.css";
import useGetUser from "@hooks/usuario/useGetUser.jsx";
import useDeleteUser from "@hooks/usuario/useDeleteUser.jsx";
import useCreateUser from "@hooks/usuario/useCreateUser.jsx";
import useEditUser from "@hooks/usuario/useEditUser.jsx";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const rolColors = {
  administrador: '#0d47a1',
  supervisor: '#0288d1',
  empleado: '#e65100',
  bodeguero: '#6a1b9a',
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
  const { handleCreateUser } = useCreateUser(fetchUsers);
  const { handleEditUser } = useEditUser(fetchUsers);

  const esAdmin = authUser?.rol === 'Administrador';

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="users-page">
      <div className="users-header">
        <div className="users-title-wrap">
          <h2>LISTADO DE PERSONAL</h2>
          <p className="users-subtitle">— todos los trabajadores</p>
        </div>
        {esAdmin && (
          <button className="users-addbtn" onClick={handleCreateUser}>
            Añadir Usuario
          </button>
        )}
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
        <thead>
          <tr>
            <th>Rut</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th>Jornada</th>
            {esAdmin && <th>Acciones</th>}
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
                <td>{u.estado}</td>
                <td>{u.jornada}</td>
                {esAdmin && (
                  <td>
                    <div className="user-acciones">
                      <button
                        className="btn-user-editar"
                        onClick={() => handleEditUser(u.id, u)}
                        title="Editar usuario"
                      >
                        <FiEdit2 />
                      </button>
                      {authUser.id !== u.id && (
                        <button
                          className="btn-user-eliminar"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Eliminar usuario"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={esAdmin ? 9 : 8}>No hay usuarios disponibles</td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;