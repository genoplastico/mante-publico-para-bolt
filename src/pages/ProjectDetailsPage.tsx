import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Users, FileText, Calendar, Building2 } from 'lucide-react';
import type { Project, Worker } from '../types';
import { WorkersList } from '../components/workers/WorkersList';
import { WorkerDetailsPage } from './WorkerDetailsPage';
import { WorkerForm } from '../components/workers/WorkerForm';
import { Modal } from '../components/ui/Modal';

interface ProjectDetailsPageProps {
  project: Project;
  onBack: () => void;
}

export function ProjectDetailsPage({ project, onBack }: ProjectDetailsPageProps) {
  const [isWorkerModalOpen, setIsWorkerModalOpen] = React.useState(false);
  const [workers] = React.useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = React.useState<Worker | null>(null);

  if (selectedWorker) {
    return (
      <WorkerDetailsPage
        worker={selectedWorker}
        onBack={() => setSelectedWorker(null)}
      />
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Volver a Obras
            </button>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{project.name}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm
              ${project.isActive 
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
              }`}
            >
              {project.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Operarios Asignados"
            value={workers.length.toString()}
            description="Ver listado completo"
          />
          <StatCard
            icon={<FileText className="h-6 w-6" />}
            label="Documentos"
            value="0"
            description="2 pendientes"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            label="Fecha de Inicio"
            value={new Date(project.createdAt).toLocaleDateString('es-ES')}
            description="Proyecto"
          />
          <StatCard
            icon={<Building2 className="h-6 w-6" />}
            label="Última Actualización"
            value={new Date(project.updatedAt).toLocaleDateString('es-ES')}
            description="Documentación"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Operarios Asignados</h2>
            <div className="mt-4">
              <div className="mb-4">
                <button
                  onClick={() => setIsWorkerModalOpen(true)}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Agregar Operario
                </button>
              </div>
              
              <WorkersList
                workers={workers}
                onViewDetails={(worker) => {
                  setSelectedWorker(worker);
                }}
              />
            </div>
          </section>

          <section className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Documentos Recientes</h2>
            <div className="mt-4">
              <EmptyState
                title="Sin documentos"
                description="No hay documentos cargados para esta obra."
                action={
                  <button className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    <FileText className="mr-2 h-4 w-4" />
                    Cargar Documentos
                  </button>
                }
              />
            </div>
          </section>
        </div>
      </div>
      
      <Modal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        title="Agregar Operario"
      >
        <WorkerForm
          onSubmit={(data) => {
            console.log('Nuevo operario:', data);
            setIsWorkerModalOpen(false);
          }}
        />
      </Modal>
    </DashboardLayout>
  );
}