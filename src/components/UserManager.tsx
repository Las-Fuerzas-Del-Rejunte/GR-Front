import { useState } from 'react';
import { useUsers } from '../context/UsersContext';
import { User, Plus, Trash2, Edit, X, Shield } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';
import Select from './ui/Select';

// Definición de roles disponibles
const ROLES = [
  { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema' },
  { value: 'manager', label: 'Gerente', description: 'Gestión de equipos y reportes' },
  { value: 'agent', label: 'Agente', description: 'Atención de reclamos' },
  { value: 'viewer', label: 'Observador', description: 'Solo lectura' }
];

// Definición de departamentos disponibles
const DEPARTAMENTOS = [
  { value: 'Atención al Cliente', label: 'Atención al Cliente' },
  { value: 'Soporte Técnico', label: 'Soporte Técnico' },
  { value: 'Ventas', label: 'Ventas' },
  { value: 'Administración', label: 'Administración' },
  { value: 'Operaciones', label: 'Operaciones' },
  { value: 'TI', label: 'TI' },
  { value: 'S/N', label: 'S/N' }
];

const UserManager = () => {
  const { users, loading, isCreating, isUpdating, isDeleting, addUser, updateUser, deleteUser } = useUsers();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'agent',
    phone: '',
    department: '',
    password: ''
  });

  const handleOpenModal = (user?: typeof users[0]) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        department: user.department || '',
        password: ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'agent',
        phone: '',
        department: '',
        password: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'agent',
      phone: '',
      department: '',
      password: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Actualizar usuario existente
        await updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          department: formData.department
        });
      } else {
        // Crear nuevo usuario
        if (!formData.password) {
          alert('La contraseña es requerida para crear un nuevo usuario');
          return;
        }
        await addUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          department: formData.department,
          password: formData.password
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${userName}"?`)) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const getRoleInfo = (roleValue: string) => {
    return ROLES.find(r => r.value === roleValue) || ROLES[2]; // Default: agent
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'agent':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'viewer':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <p className="text-sm text-gray-600 mt-1">Administra usuarios y sus roles en el sistema</p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'Sin nombre'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        <Shield className="w-3 h-3" />
                        {getRoleInfo(user.role).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.department || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(user)}
                        disabled={isUpdating}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar Usuario */}
      <Modal isOpen={showModal} onClose={handleCloseModal}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ej: Juan Pérez"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="usuario@ejemplo.com"
            />

            {!editingUser && (
              <Input
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Mínimo 8 caracteres"
              />
            )}

            <Select
              label="Rol"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={ROLES.map((role) => ({
                value: role.value,
                label: `${role.label} - ${role.description}`
              }))}
              required
              icon={<Shield className="w-5 h-5" />}
              placeholder="Seleccione un rol"
            />

            <Select
              label="Departamento"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={DEPARTAMENTOS}
              required
              placeholder="Seleccione un departamento"
            />

            <Input
              label="Teléfono"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+54 11 1234-5678"
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="flex-1"
              >
                {editingUser ? 'Actualizar' : 'Crear Usuario'}
              </Button>
              <Button
                type="button"
                onClick={handleCloseModal}
                variant="secondary"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserManager;
