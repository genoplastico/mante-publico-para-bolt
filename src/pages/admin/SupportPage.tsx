import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Headphones, MessageSquare, Mail, Phone } from 'lucide-react';

export function SupportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soporte</h1>
          <p className="mt-1 text-sm text-gray-500">
            Centro de ayuda y soporte técnico
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Chat en Vivo</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Converse con nuestro equipo de soporte en tiempo real.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <Headphones className="h-4 w-4 mr-2" />
              Iniciar Chat
            </button>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Correo Electrónico</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Envíenos un correo y le responderemos en breve.
            </p>
            <a
              href="mailto:soporte@example.com"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="h-4 w-4 mr-2" />
              Enviar Correo
            </a>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <Phone className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Teléfono</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Llámenos para obtener ayuda inmediata.
            </p>
            <a
              href="tel:+1234567890"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Llamar Ahora
            </a>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <Headphones className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold">Base de Conocimientos</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Explore nuestra documentación y tutoriales.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Ver Documentación
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                <span>¿Cómo puedo cambiar mi plan?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-3">
                Puede cambiar su plan en cualquier momento desde la sección de Configuración y Plan.
              </p>
            </details>
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                <span>¿Cómo puedo agregar más usuarios?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-3">
                Los usuarios adicionales pueden ser agregados desde la sección de Usuarios, según los límites de su plan actual.
              </p>
            </details>
            <details className="group">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                <span>¿Cuál es el límite de almacenamiento?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                </span>
              </summary>
              <p className="text-gray-600 mt-3">
                El límite de almacenamiento depende de su plan actual. Puede ver los detalles en la sección de Plan y Facturación.
              </p>
            </details>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}