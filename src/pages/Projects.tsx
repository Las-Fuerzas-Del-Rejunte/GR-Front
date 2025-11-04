import { useState, useMemo } from 'react';
import { useProjects } from '../context/ProjectsContext';
import { useCustomers } from '../context/CustomersContext';
import { useClaims } from '../context/ClaimsContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Project, ProjectType, PROJECT_TYPE_LABELS } from '../types/customer';
import { FolderPlus, Search, Edit, Trash2, Calendar, User, FileText, Plus, AlertCircle } from 'lucide-react';

const Projects = () => {
  const { projects, addProject, updateProject, deleteProject, getProjectsByCustomerId } = useProjects();
  const { customers, getCustomerById } = useCustomers();
  const { claims, getClaimsByProjectId } = useClaims();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCustomer, setFilterCustomer] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>({
    customerId: '',
    name: '',
    description: '',
    type: 'other',
    status: 'active',
    startDate: undefined,
    endDate: undefined
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        getCustomerById(p.customerId)?.name.toLowerCase().includes(query)
      );
    }
    
    if (filterCustomer) {
      filtered = filtered.filter(p => p.customerId === filterCustomer);
    }
    
    if (filterStatus) {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    if (filterType) {
      filtered = filtered.filter(p => p.type === filterType);
    }
    
    return filtered;
  }, [searchQuery, filterCustomer, filterStatus, filterType, projects, getCustomerById]);

  const handleOpenAddModal = () => {
    setFormData({
      customerId: '',
      name: '',
      description: '',
      type: 'other',
      status: 'active',
      startDate: undefined,
      endDate: undefined
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      customerId: project.customerId,
      name: project.name,
      description: project.description || '',
      type: project.type,
      status: project.status,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : undefined,
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : undefined
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerId?.trim()) {
      newErrors.customerId = 'El cliente es requerido';
    }
    
    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre del proyecto es requerido';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        newErrors.endDate = 'La fecha de fin no puede ser anterior a la fecha de inicio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const projectData = {
      customerId: formData.customerId!,
      name: formData.name!,
      description: formData.description,
      type: formData.type as ProjectType,
      status: formData.status as 'active' | 'completed' | 'on_hold' | 'cancelled',
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined
    };

    if (showAddModal) {
      addProject(projectData);
      setShowAddModal(false);
    } else if (showEditModal && selectedProject) {
      updateProject(selectedProject.id, projectData);
      setShowEditModal(false);
      setSelectedProject(null);
    }
  };

  const handleDelete = () => {
    if (selectedProject) {
      deleteProject(selectedProject.id);
      setShowDeleteModal(false);
      setSelectedProject(null);
    }
  };

  const getProjectStats = (projectId: string) => {
    const projectClaims = getClaimsByProjectId(projectId);
    return {
      claims: projectClaims.length,
      activeClaims: projectClaims.filter(c => c.status !== 'Resuelto').length
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'on_hold':
        return 'En Pausa';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestión de Proyectos</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Administra los proyectos de tus clientes
          </p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <FolderPlus className="w-4 h-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar proyectos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los clientes</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="completed">Completado</option>
            <option value="on_hold">En Pausa</option>
            <option value="cancelled">Cancelado</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Proyectos</p>
              <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <FolderPlus className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Proyectos Activos</p>
              <p className="text-3xl font-bold text-green-600">
                {projects.filter(p => p.status === 'active').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completados</p>
              <p className="text-3xl font-bold text-blue-600">
                {projects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Pausa</p>
              <p className="text-3xl font-bold text-yellow-600">
                {projects.filter(p => p.status === 'on_hold').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Lista de proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map(project => {
          const customer = getCustomerById(project.customerId);
          const stats = getProjectStats(project.id);
          return (
            <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                    <User className="w-4 h-4" />
                    {customer?.name || 'Cliente no encontrado'}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(project)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(project)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{project.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FolderPlus className="w-4 h-4" />
                  <span>{PROJECT_TYPE_LABELS[project.type]}</span>
                </div>
                {project.startDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Inicio: {new Date(project.startDate).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                )}
                {project.endDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Fin: {new Date(project.endDate).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Creado: {new Date(project.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-gray-900">{stats.claims}</span>
                    <span className="text-gray-600">reclamos</span>
                  </div>
                  {stats.activeClaims > 0 && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      {stats.activeClaims} activos
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="p-12 text-center">
          <FolderPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchQuery || filterCustomer || filterStatus || filterType 
              ? 'No se encontraron proyectos' 
              : 'No hay proyectos registrados'}
          </p>
          {!searchQuery && !filterCustomer && !filterStatus && !filterType && (
            <Button onClick={handleOpenAddModal} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Proyecto
            </Button>
          )}
        </Card>
      )}

      {/* Modal Agregar Proyecto */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Nuevo Proyecto"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.customerId || ''}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customerId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Seleccionar cliente...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.company && `- ${customer.company}`}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
              )}
            </div>
            <Input
              label="Nombre del Proyecto *"
              placeholder="Nombre descriptivo del proyecto"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                placeholder="Descripción del proyecto..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Proyecto *
              </label>
              <select
                value={formData.type || 'other'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
                <option value="on_hold">En Pausa</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Crear Proyecto
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Editar Proyecto */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          title="Editar Proyecto"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.customerId || ''}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customerId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Seleccionar cliente...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.company && `- ${customer.company}`}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
              )}
            </div>
            <Input
              label="Nombre del Proyecto *"
              placeholder="Nombre descriptivo del proyecto"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                placeholder="Descripción del proyecto..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Proyecto *
              </label>
              <select
                value={formData.type || 'other'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
                <option value="on_hold">En Pausa</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => {
                setShowEditModal(false);
                setSelectedProject(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Eliminar Proyecto */}
      {showDeleteModal && selectedProject && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProject(null);
          }}
          title="Eliminar Proyecto"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar el proyecto <strong>{selectedProject.name}</strong>?
            </p>
            <p className="text-sm text-gray-600">
              Esta acción no se puede deshacer. Si este proyecto tiene reclamos asociados, 
              deberás gestionarlos antes de eliminar el proyecto.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => {
                setShowDeleteModal(false);
                setSelectedProject(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Projects;

