import { useState } from 'react';
import { useStatuses } from '../context/StatusContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Trash2, Edit2, Check, X, Plus, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';

const Settings = () => {
  const { statuses, addStatus, deleteStatus, updateStatus } = useStatuses();
  const { showToast } = useToast();
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('blue');
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<{ id: string; name: string } | null>(null);

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

  const handleDeleteClick = (statusId: string, statusName: string) => {
    setStatusToDelete({ id: statusId, name: statusName });
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (statusToDelete) {
      deleteStatus(statusToDelete.id);
      showToast({
        type: 'success',
        title: 'Estado eliminado',
        message: `El estado "${statusToDelete.name}" ha sido eliminado correctamente.`,
        duration: 3000
      });
      setDeleteModalOpen(false);
      setStatusToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setStatusToDelete(null);
  };

  const getColorClasses = (color: string) => {
    const option = colorOptions.find(c => c.value === color);
    return option ? { bg: option.bg, text: option.text } : { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="text-sm text-gray-600 mt-1">Gestiona los estados del sistema</p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Estados de Reclamos</h2>
            <p className="text-sm text-gray-600 mt-1">Personaliza los estados disponibles para los reclamos</p>
          </div>
          {!isAddingStatus && (
            <Button onClick={() => setIsAddingStatus(true)} size="md" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Agregar Estado
            </Button>
          )}
        </div>

        {/* El formulario de creación se movió a un modal más abajo */}

        <div className="space-y-4">
          {statuses.map(status => {
            const colors = getColorClasses(status.color);
            return (
              <div
                key={status.id}
                className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${colors.bg} ${colors.text} shadow-sm`}>
                        {status.name}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(status.id, status.name, status.color)}
                        className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:shadow-sm"
                        title="Editar estado"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(status.id, status.name)}
                        className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all hover:shadow-sm"
                        title="Eliminar estado"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {statuses.length === 0 && (
          <div className="text-center py-12">
            <SettingsIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay estados configurados</p>
            <p className="text-gray-400 text-sm mt-1">Agrega tu primer estado para comenzar</p>
          </div>
        )}
      </Card>

      {/* Modal: Crear Estado */}
      <Modal isOpen={isAddingStatus} onClose={() => setIsAddingStatus(false)} title="Nuevo Estado">
        <div className="space-y-5">
          <Input
            placeholder="Nombre del estado"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            icon={<SettingsIcon className="w-4 h-4" />}
            error={!newStatusName.trim() ? 'El nombre es requerido' : ''}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Color del estado</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  onClick={() => setNewStatusColor(color.value)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all ${
                    newStatusColor === color.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white hover:shadow-sm'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full ${color.bg} border-2 border-white shadow-sm`} />
                  <span className="text-sm font-medium">{color.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setIsAddingStatus(false)} variant="secondary">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button onClick={handleAddStatus} disabled={!newStatusName.trim()}>
              <Check className="w-4 h-4" />
              Guardar Estado
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Editar Estado */}
      <Modal isOpen={editingId !== null} onClose={() => setEditingId(null)} title="Editar Estado">
        <div className="space-y-5">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            icon={<SettingsIcon className="w-4 h-4" />}
            placeholder="Nombre del estado"
            error={!editName.trim() ? 'El nombre es requerido' : ''}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Color del estado</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  onClick={() => setEditColor(color.value)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all ${
                    editColor === color.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white hover:shadow-sm'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full ${color.bg} border-2 border-white shadow-sm`} />
                  <span className="text-sm font-medium">{color.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setEditingId(null)} variant="secondary">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} disabled={!editName.trim()}>
              <Check className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        title="Confirmar Eliminación"
      >
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 bg-red-50/80 border border-red-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">¿Eliminar estado?</h3>
              <p className="text-sm text-red-700">
                Estás a punto de eliminar el estado <strong>"{statusToDelete?.name}"</strong>
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              <strong>Advertencia:</strong> Esta acción no se puede deshacer. Los reclamos que tengan este estado podrían quedar sin categoría.
            </p>
            
            <div className="bg-yellow-50/80 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Recomendación:</strong> Antes de eliminar, considera cambiar el estado de los reclamos afectados a otro estado existente.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={cancelDelete} variant="secondary">
              Cancelar
            </Button>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="w-4 h-4" />
              Eliminar Estado
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
