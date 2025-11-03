import StatusConfigManager from '../components/StatusConfigManager';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="text-sm text-gray-600 mt-1">Gestiona los estados, sub-estados y permisos del sistema</p>
          </div>
        </div>
      </div>

      <StatusConfigManager />
    </div>
  );
};

export default Settings;
