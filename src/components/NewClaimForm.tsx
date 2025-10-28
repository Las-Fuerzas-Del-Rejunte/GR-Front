import { useState, FormEvent } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import Input from './ui/Input';
import TextArea from './ui/TextArea';
import Button from './ui/Button';
import { ClaimStatus } from '../types/claim';

interface NewClaimFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const NewClaimForm = ({ onClose, onSuccess }: NewClaimFormProps) => {
  const { addClaim } = useClaims();
  const { statuses } = useStatuses();
  const [formData, setFormData] = useState({
    customerName: '',
    contactInfo: '',
    subject: '',
    description: ''
  });

  const [errors, setErrors] = useState({
    customerName: '',
    contactInfo: '',
    subject: '',
    description: ''
  });

  const validateForm = () => {
    const newErrors = {
      customerName: '',
      contactInfo: '',
      subject: '',
      description: ''
    };

    let isValid = true;

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const firstStatus = statuses[0]?.name || 'Nuevo';
    const status: ClaimStatus = firstStatus;
    addClaim({
      ...formData,
      status
    });

    onSuccess();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Nombre del Cliente"
        placeholder="Ingrese el nombre completo"
        value={formData.customerName}
        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
        error={errors.customerName}
        required
      />

      <Input
        label="Información de Contacto"
        placeholder="Email o teléfono"
        value={formData.contactInfo}
        onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
        error={errors.contactInfo}
        required
      />

      <Input
        label="Asunto del Reclamo"
        placeholder="Breve descripción del problema"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        error={errors.subject}
        required
      />

      <TextArea
        label="Descripción Detallada"
        placeholder="Describa el reclamo con el mayor detalle posible"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        error={errors.description}
        rows={6}
        required
      />

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar Reclamo
        </Button>
      </div>
    </form>
  );
};

export default NewClaimForm;
