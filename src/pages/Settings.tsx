import StatusConfigManager from '../components/StatusConfigManager';
import UserManager from '../components/UserManager';
import { Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'estados' | 'usuarios'>('estados');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="text-sm text-gray-600 mt-1">Gestiona los estados, usuarios y permisos del sistema</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('estados')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'estados'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Estados y Sub-estados
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'usuarios'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Usuarios y Roles
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'estados' && <StatusConfigManager />}
        {activeTab === 'usuarios' && <UserManager />}
      </div>
    </div>
  );
};

export default Settings;
