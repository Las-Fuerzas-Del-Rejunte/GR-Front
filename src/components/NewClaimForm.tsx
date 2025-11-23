import { useState, FormEvent, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import Input from './ui/Input';
import Select from './ui/Select';
import TextArea from './ui/TextArea';
import Button from './ui/Button';
import { ClaimStatus, Project, Client } from '../types/claim';
import { FileText, MessageSquare, Upload, X, Image, Video, Folder, Users } from 'lucide-react';
import { projectsAPI, clientsAPI } from '../services/api';

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
  const formRef = useRef<HTMLFormElement>(null);
  
  // Estados para clientes y proyectos
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    projectId: '',
    customerName: '',
    contactInfo: '',
    subject: '',
    description: ''
  });

  const [errors, setErrors] = useState({
    clientId: '',
    projectId: '',
    customerName: '',
    contactInfo: '',
    subject: '',
    description: ''
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const data = await clientsAPI.getAll();
        setClients(data);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setLoadingClients(false);
      }
    };
    
    fetchClients();
  }, []);

  // Cargar proyectos cuando se selecciona un cliente
  useEffect(() => {
    const fetchProjects = async () => {
      if (!formData.clientId) {
        setProjects([]);
        return;
      }

      setLoadingProjects(true);
      try {
        const data = await projectsAPI.getByClientId(formData.clientId);
        setProjects(data);
      } catch (error) {
        console.error('Error al cargar proyectos:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [formData.clientId]);

  // Actualizar customerName y contactInfo cuando se selecciona un proyecto
  useEffect(() => {
    if (formData.projectId && projects.length > 0) {
      const selectedProject = projects.find(p => p.id === formData.projectId);
      if (selectedProject) {
        setFormData(prev => ({
          ...prev,
          customerName: selectedProject.client.fullName,
          contactInfo: selectedProject.client.email || selectedProject.client.phone || '',
        }));
      }
    }
  }, [formData.projectId, projects]);

  const validateForm = () => {
    const newErrors = {
      clientId: '',
      projectId: '',
      customerName: '',
      contactInfo: '',
      subject: '',
      description: ''
    };

    let isValid = true;

    if (!formData.clientId) {
      newErrors.clientId = 'El cliente es requerido';
      isValid = false;
    }

    if (!formData.projectId) {
      newErrors.projectId = 'El proyecto es requerido';
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
    addClaim({
      subject: formData.subject,
      customerName: formData.customerName,
      contactInfo: formData.contactInfo,
      description: formData.description,
      projectId: formData.projectId,
      clientId: formData.clientId,
      status,
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
      {/* Selector de Cliente */}
      <Select
        label="Cliente"
        value={formData.clientId}
        onChange={(e) => {
          setFormData({ ...formData, clientId: e.target.value, projectId: '', customerName: '', contactInfo: '' });
        }}
        options={clients.map(client => ({ value: client.id, label: client.fullName }))}
        placeholder={loadingClients ? "Cargando clientes..." : "Seleccione un cliente"}
        error={errors.clientId}
        required
        disabled={loadingClients}
        icon={<Users className="w-4 h-4" />}
      />

      {/* Selector de Proyecto */}
      <Select
        label="Proyecto"
        value={formData.projectId}
        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
        options={projects.map(project => ({ value: project.id, label: project.name }))}
        placeholder={
          !formData.clientId 
            ? "Primero seleccione un cliente" 
            : loadingProjects 
            ? "Cargando proyectos..." 
            : "Seleccione un proyecto"
        }
        error={errors.projectId}
        required
        disabled={!formData.clientId || loadingProjects}
        icon={<Folder className="w-4 h-4" />}
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
