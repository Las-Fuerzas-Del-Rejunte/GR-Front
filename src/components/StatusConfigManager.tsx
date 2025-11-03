import { useState } from 'react';
import { useStatuses } from '../context/StatusContext';
import { useToast } from '../context/ToastContext';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';
import TextArea from './ui/TextArea';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Save, 
  X,
  Shield,
  Lock,
  Unlock,
  FileText,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react';
import { StatusConfig, SubStatus } from '../types/claim';

const StatusConfigManager = () => {
  const { statuses, updateStatus, addStatus, deleteStatus } = useStatuses();
  const { showToast } = useToast();

  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<StatusConfig | null>(null);
  const [isAddingStatus, setIsAddingStatus] = useState(false);

  // Sub-estados
  const [isAddingSubStatus, setIsAddingSubStatus] = useState<string | null>(null);

  // Formulario de estado
  const [formData, setFormData] = useState<Partial<StatusConfig>>({
    name: '',
    color: 'blue',
    description: '',
    area: '',
    permissions: {
      canEdit: true,
      canReassign: true,
      canAddNote: true,
      canChangeStatus: true,
      canAddInternalComment: true,
      canClose: false,
      requiresResolutionSummary: false,
      isLocked: false
    }
  });

  // Formulario de sub-estado
  const [subStatusForm, setSubStatusForm] = useState<Partial<SubStatus>>({
    name: '',
    description: ''
  });

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

  const toggleExpand = (statusId: string) => {
    setExpandedStatus(expandedStatus === statusId ? null : statusId);
  };

  const handleEditStatus = (status: StatusConfig) => {
    setEditingStatus(status);
    setFormData({
      name: status.name,
      color: status.color,
      description: status.description || '',
      area: status.area || '',
      permissions: status.permissions
    });
  };

  const handleSaveStatus = () => {
    if (!formData.name?.trim()) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'El nombre del estado es requerido'
      });
      return;
    }

    if (editingStatus) {
      // Actualizar estado existente - pasar objeto completo
      updateStatus(editingStatus.id, {
        name: formData.name!,
        color: formData.color!,
        description: formData.description,
        area: formData.area,
        permissions: formData.permissions!
      });
      
      showToast({
        type: 'success',
        title: 'Estado actualizado',
        message: `El estado "${formData.name}" se ha actualizado correctamente`
      });
    } else {
      // Crear nuevo estado
      addStatus(formData.name!, formData.color!);
      
      showToast({
        type: 'success',
        title: 'Estado creado',
        message: `El estado "${formData.name}" se ha creado correctamente`
      });
    }

    resetForm();
  };

  const handleAddSubStatus = (statusId: string) => {
    if (!subStatusForm.name?.trim()) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'El nombre del sub-estado es requerido'
      });
      return;
    }

    const status = statuses.find(s => s.id === statusId);
    if (!status) return;

    const newSubStatus: SubStatus = {
      id: `sub-${Date.now()}`,
      name: subStatusForm.name,
      description: subStatusForm.description,
      order: (status.subStatuses?.length || 0) + 1
    };

    const updatedSubStatuses = [...(status.subStatuses || []), newSubStatus];

    updateStatus(statusId, {
      subStatuses: updatedSubStatuses
    });

    showToast({
      type: 'success',
      title: 'Sub-estado agregado',
      message: `El sub-estado "${newSubStatus.name}" se ha agregado correctamente`
    });

    setSubStatusForm({ name: '', description: '' });
    setIsAddingSubStatus(null);
  };

  const handleDeleteSubStatus = (statusId: string, subStatusId: string) => {
    const status = statuses.find(s => s.id === statusId);
    if (!status) return;

    const updatedSubStatuses = status.subStatuses?.filter(sub => sub.id !== subStatusId);

    updateStatus(statusId, {
      subStatuses: updatedSubStatuses
    });

    showToast({
      type: 'success',
      title: 'Sub-estado eliminado',
      message: 'El sub-estado se ha eliminado correctamente'
    });
  };

  const handleDeleteStatus = (statusId: string, statusName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el estado "${statusName}"? Esta acción no se puede deshacer.`)) {
      deleteStatus(statusId);
      showToast({
        type: 'success',
        title: 'Estado eliminado',
        message: `El estado "${statusName}" se ha eliminado correctamente`
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: 'blue',
      description: '',
      area: '',
      permissions: {
        canEdit: true,
        canReassign: true,
        canAddNote: true,
        canChangeStatus: true,
        canAddInternalComment: true,
        canClose: false,
        requiresResolutionSummary: false,
        isLocked: false
      }
    });
    setEditingStatus(null);
    setIsAddingStatus(false);
  };

  const getColorClasses = (color: string) => {
    const option = colorOptions.find(c => c.value === color);
    return option ? { bg: option.bg, text: option.text } : { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  const PermissionSwitch = ({ 
    label, 
    description, 
    checked, 
    onChange,
    icon: Icon 
  }: { 
    label: string; 
    description: string; 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    icon: typeof Shield;
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
        <div>
          <label className="text-sm font-medium text-gray-900 block">{label}</label>
          <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Estados</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure estados, sub-estados y permisos del sistema
          </p>
        </div>
        <Button onClick={() => setIsAddingStatus(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Estado
        </Button>
      </div>

      <div className="space-y-3">
        {statuses.map(status => {
          const colors = getColorClasses(status.color);
          const isExpanded = expandedStatus === status.id;

          return (
            <Card key={status.id} className="overflow-hidden">
              {/* Header del Estado */}
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleExpand(status.id)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
                      {status.name}
                    </span>

                    {status.area && (
                      <span className="text-sm text-gray-600">
                        Área: <span className="font-medium">{status.area}</span>
                      </span>
                    )}

                    {status.permissions.isLocked && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        <Lock className="w-3 h-3" />
                        Bloqueado
                      </span>
                    )}

                    {status.subStatuses && status.subStatuses.length > 0 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {status.subStatuses.length} sub-estados
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleEditStatus(status)}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeleteStatus(status.id, status.name)}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contenido expandido */}
              {isExpanded && (
                <div className="p-6 bg-gray-50 space-y-6">
                  {/* Descripción */}
                  {status.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h4>
                      <p className="text-sm text-gray-600">{status.description}</p>
                    </div>
                  )}

                  {/* Permisos */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Permisos del Estado
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className={`flex items-center gap-2 text-sm ${status.permissions.canEdit ? 'text-green-700' : 'text-gray-400'}`}>
                        {status.permissions.canEdit ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        Puede editar
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${status.permissions.canReassign ? 'text-green-700' : 'text-gray-400'}`}>
                        {status.permissions.canReassign ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        Puede reasignar
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${status.permissions.canChangeStatus ? 'text-green-700' : 'text-gray-400'}`}>
                        {status.permissions.canChangeStatus ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        Puede cambiar estado
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${status.permissions.canAddInternalComment ? 'text-green-700' : 'text-gray-400'}`}>
                        {status.permissions.canAddInternalComment ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        Comentarios internos
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${status.permissions.requiresResolutionSummary ? 'text-blue-700' : 'text-gray-400'}`}>
                        {status.permissions.requiresResolutionSummary ? <AlertCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        Requiere resumen
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${status.permissions.isLocked ? 'text-red-700' : 'text-gray-400'}`}>
                        {status.permissions.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        Bloqueado
                      </div>
                    </div>
                  </div>

                  {/* Sub-estados */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Sub-Estados
                      </h4>
                      <Button
                        onClick={() => setIsAddingSubStatus(status.id)}
                        size="sm"
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Agregar Sub-Estado
                      </Button>
                    </div>

                    {status.subStatuses && status.subStatuses.length > 0 ? (
                      <div className="space-y-2">
                        {status.subStatuses.map(subStatus => (
                          <div
                            key={subStatus.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">{subStatus.name}</p>
                              {subStatus.description && (
                                <p className="text-xs text-gray-600 mt-0.5">{subStatus.description}</p>
                              )}
                            </div>
                            <Button
                              onClick={() => handleDeleteSubStatus(status.id, subStatus.id)}
                              variant="secondary"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No hay sub-estados configurados</p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modal: Crear/Editar Estado */}
      <Modal
        isOpen={isAddingStatus || editingStatus !== null}
        onClose={resetForm}
        title={editingStatus ? 'Editar Estado' : 'Nuevo Estado'}
      >
        <div className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <Input
              label="Nombre del Estado"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: En Proceso, Resuelto, etc."
              icon={<SettingsIcon className="w-4 h-4" />}
            />

            <Input
              label="Área Responsable"
              value={formData.area || ''}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="Ej: Soporte Técnico, Atención al Cliente"
            />

            <TextArea
              label="Descripción"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe qué significa este estado..."
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Color</label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.color === color.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${color.bg}`} />
                    <span className="text-sm font-medium">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Permisos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Permisos y Comportamiento
            </h3>
            <div className="space-y-2">
              <PermissionSwitch
                label="Puede editar"
                description="Permite modificar el reclamo"
                checked={formData.permissions?.canEdit || false}
                onChange={(checked) => setFormData({
                  ...formData,
                  permissions: { ...formData.permissions!, canEdit: checked }
                })}
                icon={Edit2}
              />
              <PermissionSwitch
                label="Puede reasignar"
                description="Permite cambiar el área o agente asignado"
                checked={formData.permissions?.canReassign || false}
                onChange={(checked) => setFormData({
                  ...formData,
                  permissions: { ...formData.permissions!, canReassign: checked }
                })}
                icon={FileText}
              />
              <PermissionSwitch
                label="Puede cambiar estado"
                description="Permite transiciones a otros estados"
                checked={formData.permissions?.canChangeStatus || false}
                onChange={(checked) => setFormData({
                  ...formData,
                  permissions: { ...formData.permissions!, canChangeStatus: checked }
                })}
                icon={CheckCircle}
              />
              <PermissionSwitch
                label="Comentarios internos"
                description="Habilita agregar notas internas"
                checked={formData.permissions?.canAddInternalComment || false}
                onChange={(checked) => setFormData({
                  ...formData,
                  permissions: { ...formData.permissions!, canAddInternalComment: checked }
                })}
                icon={FileText}
              />
              <PermissionSwitch
                label="Requiere resumen de resolución"
                description="Obliga a completar un resumen al llegar a este estado"
                checked={formData.permissions?.requiresResolutionSummary || false}
                onChange={(checked) => setFormData({
                  ...formData,
                  permissions: { ...formData.permissions!, requiresResolutionSummary: checked }
                })}
                icon={AlertCircle}
              />
              <PermissionSwitch
                label="Bloquear modificaciones"
                description="Impide cualquier cambio (estado final)"
                checked={formData.permissions?.isLocked || false}
                onChange={(checked) => setFormData({
                  ...formData,
                  permissions: { ...formData.permissions!, isLocked: checked }
                })}
                icon={Lock}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button onClick={resetForm} variant="secondary">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button onClick={handleSaveStatus}>
              <Save className="w-4 h-4" />
              {editingStatus ? 'Guardar Cambios' : 'Crear Estado'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Agregar Sub-Estado */}
      <Modal
        isOpen={isAddingSubStatus !== null}
        onClose={() => {
          setIsAddingSubStatus(null);
          setSubStatusForm({ name: '', description: '' });
        }}
        title="Agregar Sub-Estado"
      >
        <div className="space-y-4">
          <Input
            label="Nombre del Sub-Estado"
            value={subStatusForm.name || ''}
            onChange={(e) => setSubStatusForm({ ...subStatusForm, name: e.target.value })}
            placeholder="Ej: En Revisión Inicial, Pendiente de QA"
            icon={<FileText className="w-4 h-4" />}
          />

          <TextArea
            label="Descripción (opcional)"
            value={subStatusForm.description || ''}
            onChange={(e) => setSubStatusForm({ ...subStatusForm, description: e.target.value })}
            placeholder="Describe este sub-estado..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                setIsAddingSubStatus(null);
                setSubStatusForm({ name: '', description: '' });
              }}
              variant="secondary"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button onClick={() => isAddingSubStatus && handleAddSubStatus(isAddingSubStatus)}>
              <Plus className="w-4 h-4" />
              Agregar Sub-Estado
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StatusConfigManager;
