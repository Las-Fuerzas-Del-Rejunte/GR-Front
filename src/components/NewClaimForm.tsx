import { useState, FormEvent, useRef, ReactNode, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import { useCustomers } from '../context/CustomersContext';
import { useProjects } from '../context/ProjectsContext';
import Input from './ui/Input';
import TextArea from './ui/TextArea';
import Button from './ui/Button';
import { ClaimStatus, ClaimType, Severity, ClaimArea, CLAIM_TYPE_LABELS, SEVERITY_LABELS, CLAIM_AREA_LABELS, ClaimAttachment } from '../types/claim';
import { User, Mail, FileText, MessageSquare, Upload, X, Image, Video, ChevronDown, Building2, FolderOpen, AlertTriangle, Target } from 'lucide-react';

interface NewClaimFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialStatus?: string;
}

export interface NewClaimFormRef {
  submitForm: () => void;
}

const NewClaimForm = forwardRef<NewClaimFormRef, NewClaimFormProps>(({ onClose, onSuccess, initialStatus }, ref) => {
  const { addClaim } = useClaims();
  const { statuses } = useStatuses();
  const { customers, getCustomerById } = useCustomers();
  const { projects, getProjectsByCustomerId } = useProjects();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [formData, setFormData] = useState({
    customerId: '',
    projectId: '',
    customerName: '',
    contactInfo: '',
    subject: '',
    description: '',
    type: 'other' as ClaimType,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    severity: 'medium' as Severity,
    assignedToArea: null as ClaimArea | null
  });

  const [errors, setErrors] = useState({
    customerId: '',
    projectId: '',
    customerName: '',
    contactInfo: '',
    subject: '',
    description: ''
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCustomerMenu, setShowCustomerMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showSeverityMenu, setShowSeverityMenu] = useState(false);
  const [showAreaMenu, setShowAreaMenu] = useState(false);
  const [customerQuery, setCustomerQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customerMenuRef = useRef<HTMLDivElement>(null);
  const projectMenuRef = useRef<HTMLDivElement>(null);

  const availableProjects = formData.customerId ? getProjectsByCustomerId(formData.customerId) : [];
  const selectedCustomer = formData.customerId ? getCustomerById(formData.customerId) : null;
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(customerQuery.toLowerCase())
  );

  const validateForm = () => {
    const newErrors = {
      customerId: '',
      projectId: '',
      customerName: '',
      contactInfo: '',
      subject: '',
      description: ''
    };

    let isValid = true;

    if (!formData.customerId) {
      newErrors.customerId = 'Debe seleccionar un cliente';
      isValid = false;
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Debe seleccionar un proyecto';
      isValid = false;
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre del cliente es requerido';
      isValid = false;
    }

    if (!formData.contactInfo.trim()) {
      newErrors.contactInfo = 'La información de contacto es requerida';
      isValid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'El asunto es requerido';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCustomerMenu && customerMenuRef.current && !customerMenuRef.current.contains(event.target as Node)) {
        setShowCustomerMenu(false);
        setCustomerQuery('');
      }
      if (showProjectMenu && projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        setShowProjectMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCustomerMenu, showProjectMenu]);

  const handleCustomerSelect = (customerId: string) => {
    const customer = getCustomerById(customerId);
    if (customer) {
      setFormData({
        ...formData,
        customerId,
        customerName: customer.name,
        contactInfo: customer.email || customer.phone || '',
        projectId: '' // Reset project when customer changes
      });
      setShowCustomerMenu(false);
      setCustomerQuery('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const submitForm = () => {
    if (!validateForm()) {
      return;
    }

    const status: ClaimStatus = initialStatus || statuses[0]?.name || 'Nuevo';
    const claimAttachments: ClaimAttachment[] = attachments.map((file, index) => ({
      id: `attachment-${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date()
    }));

    addClaim({
      ...formData,
      status,
      attachments: claimAttachments,
      assignedAreasHistory: formData.assignedToArea ? [formData.assignedToArea] : []
    });

    onSuccess();
    onClose();
  };

  useImperativeHandle(ref, () => ({
    submitForm,
  }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
        <div className="relative" ref={customerMenuRef}>
          <button
            type="button"
            onClick={() => {
              setShowCustomerMenu(!showCustomerMenu);
              setShowProjectMenu(false);
            }}
            className={`w-full px-3 py-2.5 border-2 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group ${
              errors.customerId ? 'border-red-300' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className={selectedCustomer ? 'text-gray-900' : 'text-gray-500'}>
                {selectedCustomer ? selectedCustomer.name : 'Seleccionar cliente...'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showCustomerMenu ? 'rotate-180' : ''}`} />
          </button>
          {showCustomerMenu && (
            <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-80 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="border-t border-gray-100 p-2 space-y-1 max-h-60 overflow-y-auto">
                {filteredCustomers.map(customer => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleCustomerSelect(customer.id)}
                    className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                      formData.customerId === customer.id ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                    <p className="text-xs text-gray-600">{customer.email}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>}
      </div>

      {/* Proyecto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto *</label>
        <div className="relative" ref={projectMenuRef}>
          <button
            type="button"
            onClick={() => {
              if (!formData.customerId) return;
              setShowProjectMenu(!showProjectMenu);
              setShowCustomerMenu(false);
            }}
            disabled={!formData.customerId}
            className={`w-full px-3 py-2.5 border-2 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group ${
              errors.projectId ? 'border-red-300' : 'border-gray-200'
            } ${!formData.customerId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-gray-400" />
              <span className={formData.projectId ? 'text-gray-900' : 'text-gray-500'}>
                {formData.projectId 
                  ? availableProjects.find(p => p.id === formData.projectId)?.name 
                  : 'Seleccionar proyecto...'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showProjectMenu ? 'rotate-180' : ''}`} />
          </button>
          {showProjectMenu && availableProjects.length > 0 && (
            <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 p-2 space-y-1">
              {availableProjects.map(project => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, projectId: project.id });
                    setShowProjectMenu(false);
                  }}
                  className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                    formData.projectId === project.id ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{project.name}</p>
                  {project.description && <p className="text-xs text-gray-600">{project.description}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.projectId && <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>}
      </div>

      {/* Información del Cliente (auto-completada pero editable) */}
      <Input
        label="Nombre del Cliente"
        placeholder="Ingrese el nombre completo"
        value={formData.customerName}
        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
        error={errors.customerName}
        required
        icon={<User className="w-4 h-4" />}
      />

      <Input
        label="Información de Contacto"
        placeholder="Email o teléfono"
        value={formData.contactInfo}
        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
        error={errors.contactInfo}
        required
        icon={<Mail className="w-4 h-4" />}
      />

      <Input
        label="Asunto del Reclamo"
        placeholder="Breve descripción del problema"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        error={errors.subject}
        required
        icon={<FileText className="w-4 h-4" />}
      />

      <TextArea
        label="Descripción Detallada"
        placeholder="Describa el reclamo con el mayor detalle posible"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        error={errors.description}
        rows={6}
        required
        icon={<MessageSquare className="w-4 h-4" />}
      />

      {/* Tipo de Reclamo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reclamo</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowTypeMenu(!showTypeMenu);
              setShowSeverityMenu(false);
              setShowAreaMenu(false);
            }}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
          >
            <span className="text-gray-900">{CLAIM_TYPE_LABELS[formData.type]}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showTypeMenu ? 'rotate-180' : ''}`} />
          </button>
          {showTypeMenu && (
            <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 p-2 space-y-1">
              {Object.entries(CLAIM_TYPE_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, type: value as ClaimType });
                    setShowTypeMenu(false);
                  }}
                  className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                    formData.type === value ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                  }`}
                >
                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prioridad y Severidad en grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prioridad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSeverityMenu(false);
                setShowAreaMenu(false);
              }}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className={`text-xl ${
                  formData.priority === 'urgent' ? '🔴' :
                  formData.priority === 'high' ? '🟠' :
                  formData.priority === 'medium' ? '🟡' : '🟢'
                }`}></span>
                <span className="text-sm font-semibold text-gray-900">
                  {formData.priority === 'urgent' ? 'Urgente' :
                   formData.priority === 'high' ? 'Alta' :
                   formData.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
              </div>
            </button>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="absolute inset-0 opacity-0 cursor-pointer"
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>

        {/* Severidad (Criticidad) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Criticidad</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSeverityMenu(!showSeverityMenu);
                setShowTypeMenu(false);
                setShowAreaMenu(false);
              }}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">{SEVERITY_LABELS[formData.severity]}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showSeverityMenu ? 'rotate-180' : ''}`} />
            </button>
            {showSeverityMenu && (
              <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 p-2 space-y-1">
                {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, severity: value as Severity });
                      setShowSeverityMenu(false);
                    }}
                    className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                      formData.severity === value ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <span className="text-sm font-semibold text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asignación por Área */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Asignar a Área</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowAreaMenu(!showAreaMenu);
              setShowTypeMenu(false);
              setShowSeverityMenu(false);
            }}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-900">
                {formData.assignedToArea ? CLAIM_AREA_LABELS[formData.assignedToArea] : 'Seleccionar área...'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showAreaMenu ? 'rotate-180' : ''}`} />
          </button>
          {showAreaMenu && (
            <div className="absolute z-20 mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 p-2 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, assignedToArea: null });
                  setShowAreaMenu(false);
                }}
                className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                  !formData.assignedToArea ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                }`}
              >
                <span className="text-sm font-semibold text-gray-900">Sin asignar</span>
              </button>
              {Object.entries(CLAIM_AREA_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, assignedToArea: value as ClaimArea });
                    setShowAreaMenu(false);
                  }}
                  className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                    formData.assignedToArea === value ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                  }`}
                >
                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sección de archivos adjuntos */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Archivos Adjuntos (Imágenes/Videos)
        </label>
        <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-neutral-300 transition-colors bg-gradient-to-br from-white to-neutral-50/30">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-gray-500">
            Máximo 10MB por archivo. Formatos: JPG, PNG, GIF, MP4, MOV
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3"
          >
            Seleccionar Archivos
          </Button>
        </div>
        
        {attachments.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Archivos seleccionados:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((file, index) => (
                <div key={index} className="relative bg-gradient-to-br from-white to-neutral-50 rounded-lg border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {file.type.startsWith('image/') ? (
                    <div className="aspect-video bg-gradient-to-br from-neutral-50 to-white flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-purple-50 to-purple-100/50 flex items-center justify-center">
                      <Video className="w-12 h-12 text-purple-500" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      {file.type.startsWith('image/') ? (
                        <Image className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Video className="w-4 h-4 text-purple-500" />
                      )}
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition-colors shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
});

NewClaimForm.displayName = 'NewClaimForm';

export default NewClaimForm;
