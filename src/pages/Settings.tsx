import { useState } from 'react';
import { useStatuses } from '../context/StatusContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

const Settings = () => {
  const { statuses, addStatus, deleteStatus, updateStatus } = useStatuses();
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('blue');
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const colorOptions = [
    { value: 'blue', label: 'Azul', bg: 'bg-blue-100', text: 'text-blue-700' },
    { value: 'amber', label: 'Ámbar', bg: 'bg-amber-100', text: 'text-amber-700' },
    { value: 'orange', label: 'Naranja', bg: 'bg-orange-100', text: 'text-orange-700' },
    { value: 'green', label: 'Verde', bg: 'bg-green-100', text: 'text-green-700' },
    { value: 'red', label: 'Rojo', bg: 'bg-red-100', text: 'text-red-700' },
    { value: 'purple', label: 'Morado', bg: 'bg-purple-100', text: 'text-purple-700' },
    { value: 'pink', label: 'Rosa', bg: 'bg-pink-100', text: 'text-pink-700' },
    { value: 'teal', label: 'Turquesa', bg: 'bg-teal-100', text: 'text-teal-700' },
    { value: 'gray', label: 'Gris', bg: 'bg-gray-100', text: 'text-gray-700' }
  ];

  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;
    addStatus(newStatusName, newStatusColor);
    setNewStatusName('');
    setNewStatusColor('blue');
    setIsAddingStatus(false);
  };

  const startEdit = (statusId: string, name: string, color: string) => {
    setEditingId(statusId);
    setEditName(name);
    setEditColor(color);
  };

  const handleUpdateStatus = () => {
    if (!editName.trim() || !editingId) return;
    updateStatus(editingId, editName, editColor);
    setEditingId(null);
  };

  const handleDeleteStatus = (statusId: string) => {
    if (confirm('¿Estás seguro de eliminar este estado? Los reclamos con este estado podrían quedar sin categoría.')) {
      deleteStatus(statusId);
    }
  };

  const getColorClasses = (color: string) => {
    const option = colorOptions.find(c => c.value === color);
    return option ? { bg: option.bg, text: option.text } : { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-600 mt-1">Gestiona los estados del sistema</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Estados de Reclamos</h2>
          {!isAddingStatus && (
            <Button onClick={() => setIsAddingStatus(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Agregar Estado
            </Button>
          )}
        </div>

        {isAddingStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Nuevo Estado</h3>
            <div className="space-y-3">
              <Input
                placeholder="Nombre del estado"
                value={newStatusName}
                onChange={(e) => setNewStatusName(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewStatusColor(color.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        newStatusColor === color.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded ${color.bg}`} />
                      <span className="text-sm">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddStatus} size="sm">
                  <Check className="w-4 h-4 mr-1" />
                  Guardar
                </Button>
                <Button onClick={() => setIsAddingStatus(false)} variant="secondary" size="sm">
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {statuses.map(status => {
            const colors = getColorClasses(status.color);
            const isEditing = editingId === status.id;

            return (
              <div
                key={status.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                {isEditing ? (
                  <div className="flex-1 space-y-3">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          onClick={() => setEditColor(color.value)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                            editColor === color.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded ${color.bg}`} />
                          <span className="text-sm">{color.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleUpdateStatus} size="sm">
                        <Check className="w-4 h-4 mr-1" />
                        Guardar
                      </Button>
                      <Button onClick={() => setEditingId(null)} variant="secondary" size="sm">
                        <X className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                        {status.name}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(status.id, status.name, status.color)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStatus(status.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {statuses.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay estados configurados</p>
        )}
      </Card>
    </div>
  );
};

export default Settings;
