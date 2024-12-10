import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Plus, Search } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { WorkerForm } from '../components/workers/WorkerForm';
import { WorkersList } from '../components/workers/WorkersList';
import { WorkerDetailsPage } from './WorkerDetailsPage';
import { WorkerService } from '../services/workers';
import { useNotificationsContext } from '../contexts/NotificationsContext';
import type { Worker } from '../types';

export function WorkersPage() {
  const { notifications, markAsRead } = useNotificationsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedWorkers = await WorkerService.getWorkers();
      setWorkers(fetchedWorkers);
    } catch (err) {
      setError('Error al cargar los operarios');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorker = async (data: Omit<Worker, 'id' | 'documents'>) => {
    try {
      const newWorker = await WorkerService.createWorker(data);
      setWorkers(prev => [...prev, newWorker]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating worker:', err);
    }
  };

  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.documentNumber.includes(searchQuery)
  );

  if (selectedWorker) {
    return (
      <WorkerDetailsPage
        worker={selectedWorker}
        onBack={() => setSelectedWorker(null)}
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
          <h2 className="text-2xl font-bold text-gray-900">Operarios</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Operario
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <WorkersList
            workers={filteredWorkers}
            onViewDetails={setSelectedWorker}
          />
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nuevo Operario"
        >
          <WorkerForm onSubmit={handleCreateWorker} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}