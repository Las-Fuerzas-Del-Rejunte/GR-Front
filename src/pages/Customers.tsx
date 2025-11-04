import { useState, useMemo } from 'react';
import { useCustomers } from '../context/CustomersContext';
import { useProjects } from '../context/ProjectsContext';
import { useClaims } from '../context/ClaimsContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Customer } from '../types/customer';
import { UserPlus, Search, Edit, Trash2, Mail, Phone, Building, MapPin, Calendar, FolderOpen, FileText, Plus } from 'lucide-react';

const Customers = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, searchCustomers } = useCustomers();
  const { projects, getProjectsByCustomerId } = useProjects();
  const { claims, getClaimsByCustomerId } = useClaims();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredCustomers = useMemo(() => {
    return searchQuery ? searchCustomers(searchQuery) : customers;
  }, [searchQuery, customers, searchCustomers]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      country: '',
      notes: ''
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || '',
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || '',
      notes: customer.notes || ''
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    if (showAddModal) {
      addCustomer({
        name: formData.name!,
        email: formData.email!,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        notes: formData.notes
      });
      setShowAddModal(false);
    } else if (showEditModal && selectedCustomer) {
      updateCustomer(selectedCustomer.id, {
        name: formData.name!,
        email: formData.email!,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        notes: formData.notes
      });
      setShowEditModal(false);
      setSelectedCustomer(null);
    }
  };

  const handleDelete = () => {
    if (selectedCustomer) {
      deleteCustomer(selectedCustomer.id);
      setShowDeleteModal(false);
      setSelectedCustomer(null);
    }
  };

  const getCustomerStats = (customerId: string) => {
    const customerProjects = getProjectsByCustomerId(customerId);
    const customerClaims = getClaimsByCustomerId(customerId);
    return {
      projects: customerProjects.length,
      claims: customerClaims.length,
      activeProjects: customerProjects.filter(p => p.status === 'active').length
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestión de Clientes</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Administra la información de tus clientes y sus proyectos
          </p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar clientes por nombre, email, empresa o teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Clientes</p>
              <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Proyectos</p>
              <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Promedio de Proyectos/Cliente</p>
              <p className="text-3xl font-bold text-gray-900">
                {customers.length > 0 ? (projects.length / customers.length).toFixed(1) : '0'}
              </p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => {
          const stats = getCustomerStats(customer.id);
          return (
            <Card key={customer.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{customer.name}</h3>
                  {customer.company && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                      <Building className="w-4 h-4" />
                      {customer.company}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(customer)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal(customer)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {(customer.city || customer.country) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {customer.city && customer.country 
                        ? `${customer.city}, ${customer.country}`
                        : customer.city || customer.country}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Registrado: {new Date(customer.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FolderOpen className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-gray-900">{stats.projects}</span>
                      <span className="text-gray-600">proyectos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span className="font-semibold text-gray-900">{stats.claims}</span>
                      <span className="text-gray-600">reclamos</span>
                    </div>
                  </div>
                  {stats.activeProjects > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {stats.activeProjects} activos
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <Card className="p-12 text-center">
          <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchQuery ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </p>
          {!searchQuery && (
            <Button onClick={handleOpenAddModal} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Cliente
            </Button>
          )}
        </Card>
      )}

      {/* Modal Agregar Cliente */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Nuevo Cliente"
        >
          <div className="space-y-4">
            <Input
              label="Nombre *"
              placeholder="Nombre completo"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />
            <Input
              label="Email *"
              placeholder="email@ejemplo.com"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />
            <Input
              label="Teléfono"
              placeholder="+54 11 1234-5678"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Empresa"
              placeholder="Nombre de la empresa"
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              label="Dirección"
              placeholder="Dirección completa"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ciudad"
                placeholder="Ciudad"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="País"
                placeholder="País"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                placeholder="Notas adicionales sobre el cliente..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Crear Cliente
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCustomer(null);
          }}
          title="Editar Cliente"
        >
          <div className="space-y-4">
            <Input
              label="Nombre *"
              placeholder="Nombre completo"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />
            <Input
              label="Email *"
              placeholder="email@ejemplo.com"
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />
            <Input
              label="Teléfono"
              placeholder="+54 11 1234-5678"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Empresa"
              placeholder="Nombre de la empresa"
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              label="Dirección"
              placeholder="Dirección completa"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ciudad"
                placeholder="Ciudad"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="País"
                placeholder="País"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                placeholder="Notas adicionales sobre el cliente..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => {
                setShowEditModal(false);
                setSelectedCustomer(null);
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

      {/* Modal Eliminar Cliente */}
      {showDeleteModal && selectedCustomer && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCustomer(null);
          }}
          title="Eliminar Cliente"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar a <strong>{selectedCustomer.name}</strong>?
            </p>
            <p className="text-sm text-gray-600">
              Esta acción no se puede deshacer. Si este cliente tiene proyectos o reclamos asociados, 
              deberás gestionarlos antes de eliminar el cliente.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => {
                setShowDeleteModal(false);
                setSelectedCustomer(null);
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

export default Customers;

