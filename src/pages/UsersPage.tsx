import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { UserService } from '../services/users';
import { ProjectService } from '../services/projects';
import { Shield, ShieldAlert, Building2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';
import type { User, Project, UserRole } from '../types';

export function UsersPage() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedUsers, fetchedProjects] = await Promise.all([
        UserService.getUsers(),
        ProjectService.getProjects()
      ]);
      setUsers(fetchedUsers);
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await UserService.updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleProjectAssignment = async (userId: string, projectId: string, assign: boolean) => {
    try {
      if (assign) {
        await UserService.assignProjectToUser(userId, projectId);
      } else {
        await UserService.removeProjectFromUser(userId, projectId);
      }
      await loadData(); // Recargar datos para reflejar cambios
    } catch (error) {
      console.error('Error managing project assignment:', error);
    }
  };

  if (!hasPermission('manageUsers')) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <ShieldAlert className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Acceso Denegado</h3>
          <p className="mt-1 text-sm text-gray-500">
            No tiene permisos para acceder a esta sección.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="mt-1 text-sm text-gray-500">
              Administre los usuarios y sus permisos en el sistema
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map(user => (
                <li key={user.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {user.role === 'super' ? (
                          <Shield className="h-5 w-5 text-blue-600" />
                        ) : (
                          <ShieldAlert className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.projectIds && user.projectIds.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {user.projectIds.map(projectId => {
                                const project = projects.find(p => p.id === projectId);
                                return project ? (
                                  <span
                                    key={projectId}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    <Building2 className="w-3 h-3 mr-1" />
                                    {project.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="secondary">Usuario</option>
                          <option value="super">Administrador</option>
                        </select>
                        
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Building2 className="h-4 w-4 mr-1" />
                          {user.projectIds?.length ? 'Gestionar Obras' : 'Asignar Obras'}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          title="Asignar Obras"
        >
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Seleccione las obras a las que {selectedUser.name} tendrá acceso
              </p>
              
              <div className="mt-4 space-y-2">
                {projects.map(project => (
                  <label key={project.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedUser.projectIds?.includes(project.id) || false}
                      onChange={(e) => handleProjectAssignment(
                        selectedUser.id,
                        project.id,
                        e.target.checked
                      )}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">{project.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}