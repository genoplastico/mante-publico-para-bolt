import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { ProjectForm } from '../components/projects/ProjectForm';
import type { Project } from '../types';
import { ProjectDetailsPage } from './ProjectDetailsPage';

export function ProjectsPage({
  notifications,
  onMarkNotificationAsRead
}: ProjectsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Edificio Residencial Torres del Puerto',
      isActive: true,
      createdAt: '2024-03-15',
      updatedAt: '2024-03-20',
    },
    {
      id: '2',
      name: 'Centro Comercial Plaza Nueva',
      isActive: true,
      createdAt: '2024-02-01',
      updatedAt: '2024-03-19',
    },
    {
      id: '3',
      name: 'Hospital Regional Norte',
      isActive: false,
      createdAt: '2023-08-15',
      updatedAt: '2024-01-20',
    },
  ]);

  const handleCreateProject = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [...prev, newProject]);
    setIsModalOpen(false);
  };

  const handleEditProject = (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedProject) return;
    
    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProject.id
          ? {
              ...project,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : project
      )
    );
    setSelectedProject(null);
    setIsModalOpen(false);
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
      onMarkNotificationAsRead={onMarkNotificationAsRead}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Obras</h2>
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
        </div>

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
          >
            Ver detalles
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}