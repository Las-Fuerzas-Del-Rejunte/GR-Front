import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Mail, Phone, Building, Calendar, Shield, Edit2, Save, X, FileText, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'El nombre es requerido'
      });
      return;
    }

    updateUser(formData);
    showToast({
      type: 'success',
      title: 'Perfil actualizado',
      message: 'Tu información ha sido guardada correctamente'
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      position: user?.position || '',
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-sm text-gray-600 mt-1">Gestiona tu información personal y preferencias</p>
          </div>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="space-y-8">
        {/* Header con Avatar y Info Principal */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">{user && getInitials(user.name)}</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{user?.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="capitalize font-medium">{user?.role}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{user?.department || 'Sin departamento'}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Miembro desde {new Date().getFullYear()}</span>
                    </span>
                  </div>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    Editar Perfil
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Información Detallada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información de Contacto */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleCancel} variant="secondary" size="sm">
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} size="sm">
                    <Save className="w-4 h-4" />
                    Guardar
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                {isEditing ? (
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    icon={<User className="w-4 h-4" />}
                    placeholder="Tu nombre completo"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900 font-medium">{user?.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                {isEditing ? (
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    icon={<Mail className="w-4 h-4" />}
                    placeholder="tu@email.com"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <Mail className="w-5 h-5 text-green-600" />
                    <span className="text-gray-900 font-medium">{user?.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                {isEditing ? (
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    icon={<Phone className="w-4 h-4" />}
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-900 font-medium">{user?.phone || 'No especificado'}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Información Laboral */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Información Laboral</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                {isEditing ? (
                  <Input
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    icon={<Building className="w-4 h-4" />}
                    placeholder="Departamento"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                    <Building className="w-5 h-5 text-orange-600" />
                    <span className="text-gray-900 font-medium">{user?.department || 'No especificado'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
                {isEditing ? (
                  <Input
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    icon={<Shield className="w-4 h-4" />}
                    placeholder="Tu cargo"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    <span className="text-gray-900 font-medium">{user?.position || 'No especificado'}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Estadísticas y Preferencias */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Estadísticas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Estadísticas de Trabajo</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Reclamos Asignados</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Resueltos este mes</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiempo promedio</p>
                    <p className="text-2xl font-bold text-gray-900">2.5 días</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Preferencias */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Preferencias del Sistema</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-neutral-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notificaciones por email</p>
                    <p className="text-xs text-gray-600">Recibe actualizaciones importantes</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-neutral-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-400 rounded"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Modo oscuro</p>
                    <p className="text-xs text-gray-600">Cambiar tema de la interfaz</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-gray-300 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
