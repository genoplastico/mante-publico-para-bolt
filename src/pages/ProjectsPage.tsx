import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { ProjectForm } from '../components/projects/ProjectForm';
import type { Project } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNotificationsContext } from '../contexts/NotificationsContext';
import { ProjectDetailsPage } from './ProjectDetailsPage';
import { ProjectService } from '../services/projects';

export function ProjectsPage() {
  const { hasPermission } = useAuth();
  const { notifications, markAsRead } = useNotificationsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedProjects = await ProjectService.getProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Error al cargar los proyectos';
      console.error('Error loading projects:', err);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!hasPermission('createProject')) {
        throw new Error('No tiene permisos para crear proyectos');
      }
      const newProject = await ProjectService.createProject(data);
      setProjects(prev => [...prev, newProject]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const handleEditProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!selectedProject) return;
      if (!hasPermission('editProject')) {
        throw new Error('No tiene permisos para editar proyectos');
      }
      await ProjectService.updateProject(selectedProject.id, data);
      setProjects(prev =>
        prev.map(project =>
          project.id === selectedProject.id
            ? { ...project, ...data }
            : project
        )
      );
      setSelectedProject(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  if (viewingProject) {
    return (
      <ProjectDetailsPage
        project={viewingProject}
        onBack={() => setViewingProject(null)}
      />
    );
  }

  return (
    <DashboardLayout
      notifications={notifications}
      onMarkNotificationAsRead={markAsRead}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Obras</h2>
          {error && (
            <div className="bg-red-50 text-red-700 p-2 rounded-md text-sm">
              {error}
            </div>
          )}
          {hasPermission('createProject') && (
            <button
              onClick={() => {
                setSelectedProject(null);
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Obra
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay obras registradas
          </div>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => setViewingProject(project)}
                onEdit={() => openEditModal(project)}
              />
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
          title={selectedProject ? 'Editar Obra' : 'Nueva Obra'}
        >
          <ProjectForm
            onSubmit={selectedProject ? handleEditProject : handleCreateProject}
            initialData={selectedProject ?? undefined}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
}

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onView: () => void;
}

function ProjectCard({ project, onEdit, onView }: ProjectCardProps) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('editProject');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
          <div className="flex items-center space-x-2">
            {project.isActive ? (
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Activa
              </span>
            ) : (
              <span className="flex items-center text-gray-500 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                Inactiva
              </span>
            )}
            <span className="text-sm text-gray-500">
              · Actualizada el {new Date(project.updatedAt).toLocaleDateString('es-ES')}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onView}
            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            title="Ver detalles de la obra"
          >
            Ver detalles
          </button>
          {canEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
              title="Editar obra"
            >
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}