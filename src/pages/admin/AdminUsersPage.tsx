import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UserService } from '../../services/users';
import { Shield, Users, AlertCircle, Mail, UserCog, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import type { User, SaasRole } from '../../types';

const getRoleStyle = (role: string): string => {
  switch (role) {
    case 'super':
      return 'bg-purple-100 text-purple-800';
    case 'secondary':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'super', label: 'Administrador' },
  { value: 'secondary', label: 'Usuario' }
];

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<{ id: string; loading: boolean } | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedUsers = await UserService.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: SaasRole) => {
    try {
      setUpdateStatus({ id: userId, loading: true });
      await UserService.updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Error al actualizar el rol del usuario');
    } finally {
      setUpdateStatus(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      await UserService.deleteUser(userToDelete.id);
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Error al eliminar el usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestione los usuarios y sus roles
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {user.role === 'super' ? (
                        <Shield className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Users className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="ml-3">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-1.5 text-gray-400" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <UserCog className="h-4 w-4 text-gray-400 mr-2" />
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`text-sm border-0 rounded-md py-1 pl-2 pr-8 ${getRoleStyle(user.role)}`}
                          disabled={updateStatus?.id === user.id}
                        >
                          {ROLE_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteModalOpen(true);
                          }}
                          className="ml-4 p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        {updateStatus?.id === user.id && (
                          <div className="ml-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    ID: {user.id}
                  </div>
                  {error && updateStatus?.id === user.id && (
                    <div className="mt-2 text-xs text-red-600">
                      {error}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-600 flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Total de usuarios: {users.length}
        </div>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          title="Eliminar Usuario"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Está seguro que desea eliminar al usuario {userToDelete?.name}?
              Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  'Eliminar Usuario'
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}