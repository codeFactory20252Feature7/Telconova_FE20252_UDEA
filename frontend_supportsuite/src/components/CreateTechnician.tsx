import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToastNotifications } from '@/components/ui/toast-container';
import { ZONES, SPECIALTIES, TIME_BLOCKS } from '@/lib/mockData';
import { getTechnicians, saveTechnicians } from '@/lib/storage';

interface CreateTechnicianProps {
  onTechnicianCreated?: () => void;
}

export const CreateTechnician: React.FC<CreateTechnicianProps> = ({ onTechnicianCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    zona: '',
    especialidad: '',
    carga: 0,
    disponibilidad: [] as string[]
  });

  const { addToast } = useToastNotifications();

  const handleAvailabilityChange = (timeBlock: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      disponibilidad: checked 
        ? [...prev.disponibilidad, timeBlock]
        : prev.disponibilidad.filter(tb => tb !== timeBlock)
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.zona || !formData.especialidad) {
      addToast({
        type: 'error',
        title: 'Campos requeridos',
        description: 'Todos los campos son obligatorios'
      });
      return;
    }

    if (formData.disponibilidad.length === 0) {
      addToast({
        type: 'error',
        title: 'Disponibilidad requerida',
        description: 'Debe seleccionar al menos un horario de disponibilidad'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      addToast({
        type: 'error',
        title: 'Email inválido',
        description: 'Por favor ingrese un email válido'
      });
      return;
    }

    try {
      const technicians = getTechnicians();
      
      // Check if email already exists
      if (technicians.some(tech => tech.email === formData.email)) {
        addToast({
          type: 'error',
          title: 'Email duplicado',
          description: 'Ya existe un técnico con este email'
        });
        return;
      }

      // Generate new ID
      const maxId = Math.max(
        ...technicians.map(tech => parseInt(tech.id.replace('t', '')) || 1),
        0
      );
      const newId = `t${maxId + 1}`;

      // Create new technician
      const newTechnician = {
        id: newId,
        ...formData
      };

      // Save to storage
      const updatedTechnicians = [...technicians, newTechnician];
      saveTechnicians(updatedTechnicians);

      // Reset form
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        zona: '',
        especialidad: '',
        carga: 0,
        disponibilidad: []
      });

      setIsOpen(false);

      addToast({
        type: 'success',
        title: 'Técnico creado',
        description: `${newTechnician.nombre} ha sido agregado exitosamente`
      });

      // Notify parent component
      onTechnicianCreated?.();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error al crear',
        description: 'No se pudo crear el técnico'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient">
          <Plus className="h-4 w-4 mr-2" />
          Crear Técnico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Técnico</DialogTitle>
          <DialogDescription>
            Complete los detalles para agregar un nuevo técnico al sistema
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Carlos Pérez"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="carlos.perez@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                placeholder="+57-300-1234567"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="carga">Carga inicial</Label>
              <Select 
                value={formData.carga.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, carga: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione carga" />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}/5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Zone and Specialty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zona">Zona *</Label>
              <Select 
                value={formData.zona} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, zona: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione zona" />
                </SelectTrigger>
                <SelectContent>
                  {ZONES.map(zone => (
                    <SelectItem key={zone} value={zone}>
                      {zone.charAt(0).toUpperCase() + zone.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="especialidad">Especialidad *</Label>
              <Select 
                value={formData.especialidad} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, especialidad: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Availability */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Disponibilidad horaria *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TIME_BLOCKS.map(timeBlock => (
                <div key={timeBlock} className="flex items-center space-x-2">
                  <Checkbox
                    id={`new-time-${timeBlock}`}
                    checked={formData.disponibilidad.includes(timeBlock)}
                    onCheckedChange={(checked) => handleAvailabilityChange(timeBlock, !!checked)}
                  />
                  <Label htmlFor={`new-time-${timeBlock}`} className="text-sm">
                    {timeBlock}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              Crear Técnico
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};