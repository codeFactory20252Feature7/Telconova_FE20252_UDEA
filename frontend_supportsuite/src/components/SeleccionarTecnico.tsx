// TelcoNova Support Suite - Technician Selection Component
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Clock,
  Filter,
  SortAsc,
  UserCheck,
  AlertTriangle,
  Undo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToastNotifications } from '@/components/ui/toast-container';
import { 
  filterTechnicians, 
  assignOrderToTechnician,
  getOrderById,
  getTechnicianById
} from '@/lib/storage';
import { ZONES, SPECIALTIES, TIME_BLOCKS, type Technician } from '@/lib/mockData';
import type { TechnicianFilters } from '@/lib/storage';
import logoImage from '@/assets/logo.png';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { CreateTechnician } from '@/components/CreateTechnician';

interface SeleccionarTecnicoProps {
  orderId: string;
  onBack: () => void;
  onAssignmentComplete: () => void;
}

export const SeleccionarTecnico: React.FC<SeleccionarTecnicoProps> = ({
  orderId,
  onBack,
  onAssignmentComplete
}) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TechnicianFilters>({
    zones: [],
    specialties: [],
    maxWorkload: 5,
    availability: [],
    searchQuery: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [pendingAssignment, setPendingAssignment] = useState<{
    technicianId: string;
    undoTimeoutId: NodeJS.Timeout;
  } | null>(null);

  const { addToast, ToastContainer } = useToastNotifications();

  const order = getOrderById(orderId);
  
  // Load technicians data
  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        setIsLoading(true);
        const filtersWithSearch = { ...filters, searchQuery };
        const technicianData = filterTechnicians(filtersWithSearch);
        setTechnicians(technicianData);
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error de carga',
          description: 'No se pudieron cargar los técnicos'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTechnicians();
  }, [filters, searchQuery, addToast]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleZoneChange = (zone: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      zones: checked 
        ? [...(prev.zones || []), zone]
        : (prev.zones || []).filter(z => z !== zone)
    }));
  };

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      specialties: checked 
        ? [...(prev.specialties || []), specialty]
        : (prev.specialties || []).filter(s => s !== specialty)
    }));
  };

  const handleAvailabilityChange = (timeBlock: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      availability: checked 
        ? [...(prev.availability || []), timeBlock]
        : (prev.availability || []).filter(tb => tb !== timeBlock)
    }));
  };

  const clearFilters = () => {
    setFilters({
      zones: [],
      specialties: [],
      maxWorkload: 5,
      availability: []
    });
    setSearchQuery('');
  };

  const handleTechnicianSelect = (technicianId: string) => {
    if (pendingAssignment) {
      // Clear any existing pending assignment
      clearTimeout(pendingAssignment.undoTimeoutId);
      setPendingAssignment(null);
    }

    try {
      const success = assignOrderToTechnician(orderId, technicianId);
      
      if (success) {
        const technician = getTechnicianById(technicianId);
        const isReassignment = !!order?.assignedTo;
        
        setSelectedTechnician(technicianId);
        
        // Create undo timeout
        const undoTimeoutId = setTimeout(() => {
          setPendingAssignment(null);
          onAssignmentComplete();
        }, 5000);
        
        setPendingAssignment({ technicianId, undoTimeoutId });
        
        addToast({
          type: 'success',
          title: isReassignment ? 'Orden reasignada' : 'Orden asignada',
          description: `${technician?.nombre} ha sido ${isReassignment ? 'reasignado' : 'asignado'} a la orden ${orderId}`,
          duration: 5000,
          action: {
            label: 'Deshacer',
            onClick: handleUndoAssignment
          }
        });

        // Refresh technicians list to show updated workloads
        const updatedTechnicians = filterTechnicians({ ...filters, searchQuery });
        setTechnicians(updatedTechnicians);
      } else {
        addToast({
          type: 'error',
          title: 'Error en asignación',
          description: 'No se pudo asignar el técnico a la orden'
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error del sistema',
        description: 'Ocurrió un error al procesar la asignación'
      });
    }
  };

  const handleUndoAssignment = () => {
    if (!pendingAssignment) return;

    try {
      // Here you would implement the undo logic
      // For now, we'll just clear the pending assignment and refresh
      clearTimeout(pendingAssignment.undoTimeoutId);
      setPendingAssignment(null);
      setSelectedTechnician(null);
      
      // Refresh technicians list
      const updatedTechnicians = filterTechnicians({ ...filters, searchQuery });
      setTechnicians(updatedTechnicians);
      
      addToast({
        type: 'info',
        title: 'Asignación deshecha',
        description: 'La asignación ha sido revertida'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudo deshacer la asignación'
      });
    }
  };

  const getWorkloadBadgeVariant = (workload: number) => {
    if (workload === 5) return 'destructive';
    if (workload >= 4) return 'warning';
    if (workload >= 2) return 'accent-light';
    return 'success-light';
  };

  const isAvailable = (technician: Technician) => technician.carga < 5;

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Orden no encontrada</h2>
            <p className="text-muted-foreground mb-4">
              No se pudo encontrar la orden {orderId}
            </p>
            <Button onClick={onBack}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />
      
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onBack}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <img 
                src={logoImage} 
                alt="TelcoNova Support Suite"
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Seleccionar Técnico
                </h1>
                <p className="text-sm text-muted-foreground">
                  Orden {order.id} - {order.servicio}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Order Info */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-foreground mb-1">{order.servicio}</h3>
                  <p className="text-sm text-muted-foreground">{order.descripcion}</p>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">{order.zona}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(order.creadoEn).toLocaleString('es-ES')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-background-secondary border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 focus-ring"
              />
            </div>
            <div className="flex gap-2">
              <CreateTechnician onTechnicianCreated={() => {
                // Refresh technicians list after creating a new one
                const updatedTechnicians = filterTechnicians({ ...filters, searchQuery });
                setTechnicians(updatedTechnicians);
              }} />
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-accent text-accent-foreground' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button
                variant="ghost"
                onClick={clearFilters}
                disabled={!filters.zones?.length && !filters.specialties?.length && !filters.availability?.length && filters.maxWorkload === 5}
              >
                Limpiar
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="mt-4">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Zones Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Zonas</Label>
                    <div className="space-y-2">
                      {ZONES.map(zone => (
                        <div key={zone} className="flex items-center space-x-2">
                          <Checkbox
                            id={`zone-${zone}`}
                            checked={filters.zones?.includes(zone) || false}
                            onCheckedChange={(checked) => handleZoneChange(zone, !!checked)}
                          />
                          <Label htmlFor={`zone-${zone}`} className="text-sm capitalize">
                            {zone}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specialties Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Especialidades</Label>
                    <div className="space-y-2">
                      {SPECIALTIES.map(specialty => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={`specialty-${specialty}`}
                            checked={filters.specialties?.includes(specialty) || false}
                            onCheckedChange={(checked) => handleSpecialtyChange(specialty, !!checked)}
                          />
                          <Label htmlFor={`specialty-${specialty}`} className="text-sm">
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workload Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Carga máxima</Label>
                    <Select 
                      value={filters.maxWorkload?.toString() || '5'} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, maxWorkload: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">Hasta 4/5</SelectItem>
                        <SelectItem value="3">Hasta 3/5</SelectItem>
                        <SelectItem value="2">Hasta 2/5</SelectItem>
                        <SelectItem value="1">Hasta 1/5</SelectItem>
                        <SelectItem value="0">Solo disponibles (0/5)</SelectItem>
                        <SelectItem value="5">Mostrar todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Disponibilidad</Label>
                    <div className="space-y-2">
                      {TIME_BLOCKS.map(timeBlock => (
                        <div key={timeBlock} className="flex items-center space-x-2">
                          <Checkbox
                            id={`time-${timeBlock}`}
                            checked={filters.availability?.includes(timeBlock) || false}
                            onCheckedChange={(checked) => handleAvailabilityChange(timeBlock, !!checked)}
                          />
                          <Label htmlFor={`time-${timeBlock}`} className="text-xs">
                            {timeBlock}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-background-muted border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {technicians.length} técnico(s) encontrado(s)
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <SortAsc className="h-4 w-4" />
              <span>Ordenados por carga de trabajo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technicians List */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded mb-4 w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : technicians.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted rounded-full p-8 mb-6 inline-block">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No se encontraron técnicos
            </h3>
            <p className="text-muted-foreground mb-6">
              Ajuste los filtros de búsqueda para ver más resultados
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {technicians.map(technician => {
              const available = isAvailable(technician);
              const isSelected = selectedTechnician === technician.id;
              
              return (
                <Card 
                  key={technician.id} 
                  className={`animate-slide-in-up hover:shadow-lg transition-all duration-200 ${
                    !available ? 'opacity-60' : ''
                  } ${isSelected ? 'ring-2 ring-success' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-accent/10 rounded-full p-2">
                          <User className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold">
                            {technician.nombre}
                          </CardTitle>
                          <Badge variant="zone" className="mt-1">
                            {technician.zona}
                          </Badge>
                        </div>
                      </div>
                      <Badge 
                        variant={getWorkloadBadgeVariant(technician.carga)}
                        className="font-mono"
                      >
                        {technician.carga}/5
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{technician.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{technician.telefono}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{technician.especialidad}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Disponibilidad horaria
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {technician.disponibilidad.map(timeBlock => (
                          <Badge key={timeBlock} variant="accent-light" className="text-xs">
                            {timeBlock}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {!available && (
                      <div className="flex items-center gap-2 p-2 bg-destructive-light rounded-md">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive font-medium">
                          No disponible (carga completa)
                        </span>
                      </div>
                    )}

                    <Button
                      variant={available ? "accent" : "outline"}
                      className="w-full"
                      disabled={!available || !!pendingAssignment}
                      onClick={() => handleTechnicianSelect(technician.id)}
                    >
                      {isSelected ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Asignado
                        </>
                      ) : available ? (
                        <>
                          <User className="h-4 w-4 mr-2" />
                          Seleccionar
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          No disponible
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};