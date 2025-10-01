// TelcoNova Support Suite - Manual Assignments Dashboard
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  User, 
  Clock,
  UserCheck,
  UserX,
  Filter,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToastNotifications } from '@/components/ui/toast-container';
import { 
  getOrders, 
  searchOrders, 
  createOrder, 
  getTechnicians,
  getTechnicianById 
} from '@/lib/storage';
import { ZONES } from '@/lib/mockData';
import type { Order } from '@/lib/mockData';
import logoImage from '@/assets/logo.png';
import { DarkModeToggle } from '@/components/DarkModeToggle';

interface AsignacionesManualesProps {
  onSelectTechnician: (orderId: string) => void;
  onLogout: () => void;
}

export const AsignacionesManuales: React.FC<AsignacionesManualesProps> = ({ 
  onSelectTechnician, 
  onLogout 
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    zona: '',
    servicio: '',
    descripcion: ''
  });
  const [activeTab, setActiveTab] = useState<'manual' | 'automatic' | 'reports'>('manual');
  const [isLoading, setIsLoading] = useState(true);
  
  const { addToast, ToastContainer } = useToastNotifications();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const ordersData = getOrders();
        setOrders(ordersData);
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error de carga',
          description: 'No se pudieron cargar las órdenes'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [addToast]);

  // Refresh orders data when coming back from technician selection
  const refreshOrders = () => {
    const ordersData = getOrders();
    setOrders(ordersData);
  };

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    return searchOrders(searchQuery);
  }, [orders, searchQuery]);

  // Get technician info for assigned orders
  const getTechnicianName = (technicianId?: string): string => {
    if (!technicianId) return '';
    const technician = getTechnicianById(technicianId);
    return technician?.nombre || 'Técnico no encontrado';
  };

  const handleCreateOrder = () => {
    if (!newOrderData.zona || !newOrderData.servicio || !newOrderData.descripcion) {
      addToast({
        type: 'error',
        title: 'Campos requeridos',
        description: 'Todos los campos son obligatorios'
      });
      return;
    }

    try {
      const newOrder = createOrder(newOrderData);
      setOrders(getOrders()); // Refresh orders list
      setIsCreateModalOpen(false);
      setNewOrderData({ zona: '', servicio: '', descripcion: '' });
      
      addToast({
        type: 'success',
        title: 'Orden creada',
        description: `Orden ${newOrder.id} creada exitosamente`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error al crear',
        description: 'No se pudo crear la orden'
      });
    }
  };

  const handleAssignTechnician = (orderId: string) => {
    // Refresh orders before opening technician selection
    refreshOrders();
    onSelectTechnician(orderId);
  };

  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showComingSoon = (feature: string) => {
    addToast({
      type: 'info',
      title: 'Próximamente',
      description: `${feature} estará disponible pronto`
    });
  };

  const renderTabContent = () => {
    if (activeTab !== 'manual') {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted rounded-full p-8 mb-6">
            <Clock className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {activeTab === 'automatic' ? 'Asignación Automática' : 'Reporte de Asignaciones'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Esta funcionalidad estará disponible próximamente. Por ahora, puede usar la asignación manual.
          </p>
          <Button 
            variant="outline"
            onClick={() => setActiveTab('manual')}
          >
            Ir a Asignación Manual
          </Button>
        </div>
      );
    }

    return (
      <>
        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de orden, servicio, zona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 focus-ring"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Crear Orden
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Orden</DialogTitle>
                <DialogDescription>
                  Complete los detalles para crear una nueva orden de servicio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="zona">Zona</Label>
                  <Select 
                    value={newOrderData.zona} 
                    onValueChange={(value) => setNewOrderData(prev => ({ ...prev, zona: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una zona" />
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
                  <Label htmlFor="servicio">Servicio</Label>
                  <Input
                    id="servicio"
                    placeholder="Ej: Instalación eléctrica"
                    value={newOrderData.servicio}
                    onChange={(e) => setNewOrderData(prev => ({ ...prev, servicio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Descripción detallada del trabajo a realizar"
                    value={newOrderData.descripcion}
                    onChange={(e) => setNewOrderData(prev => ({ ...prev, descripcion: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreateOrder} className="w-full">
                  Crear Orden
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Orders List - Split Layout */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
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
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-muted rounded-full p-8 mb-6 inline-block">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'Sin resultados' : 'No hay órdenes disponibles'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? `No se encontraron órdenes que coincidan con "${searchQuery}"`
                : 'No hay órdenes registradas en el sistema'
              }
            </p>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Limpiar búsqueda
              </Button>
            ) : (
              <Button 
                variant="gradient"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Orden
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 h-[calc(100vh-280px)]">
            {/* Pending Orders - Left Side */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <UserX className="h-5 w-5 text-warning" />
                <h3 className="text-lg font-semibold text-foreground">
                  Órdenes Pendientes 
                </h3>
                <Badge variant="warning-light">
                  {filteredOrders.filter(order => !order.assignedTo).length}
                </Badge>
              </div>
              <div className="overflow-y-auto space-y-4 pr-2 flex-1" style={{scrollbarWidth: 'thin'}}>
                {filteredOrders
                  .filter(order => !order.assignedTo)
                  .map(order => (
                    <Card key={order.id} className="animate-slide-in-up hover:shadow-lg transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold text-primary">
                            {order.id}
                          </CardTitle>
                          <Badge variant="zone">
                            {order.zona}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-foreground mb-1">
                            {order.servicio}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {order.descripcion}
                          </p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateTime(order.creadoEn)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="capitalize">{order.zona}</span>
                          </div>
                        </div>

                        <Button
                          variant="accent"
                          className="w-full"
                          onClick={() => handleAssignTechnician(order.id)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Asignar
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                }
                {filteredOrders.filter(order => !order.assignedTo).length === 0 && (
                  <div className="text-center py-8">
                    <UserCheck className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No hay órdenes pendientes
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Orders - Right Side */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck className="h-5 w-5 text-success" />
                <h3 className="text-lg font-semibold text-foreground">
                  Órdenes Asignadas
                </h3>
                <Badge variant="success-light">
                  {filteredOrders.filter(order => order.assignedTo).length}
                </Badge>
              </div>
              <div className="overflow-y-auto space-y-4 pr-2 flex-1" style={{scrollbarWidth: 'thin'}}>
                {filteredOrders
                  .filter(order => order.assignedTo)
                  .map(order => (
                    <Card key={order.id} className="animate-slide-in-up hover:shadow-lg transition-all duration-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold text-primary">
                            {order.id}
                          </CardTitle>
                          <Badge variant="zone">
                            {order.zona}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-foreground mb-1">
                            {order.servicio}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {order.descripcion}
                          </p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateTime(order.creadoEn)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="capitalize">{order.zona}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-2 bg-success-light rounded-md">
                          <UserCheck className="h-4 w-4 text-success" />
                          <span className="text-sm text-success font-medium">
                            {getTechnicianName(order.assignedTo)}
                          </span>
                        </div>

                        <Button
                          variant="outline-accent"
                          className="w-full"
                          onClick={() => handleAssignTechnician(order.id)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Reasignar
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                }
                {filteredOrders.filter(order => order.assignedTo).length === 0 && (
                  <div className="text-center py-8">
                    <UserX className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No hay órdenes asignadas
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />
      
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={logoImage} 
                alt="TelcoNova Support Suite"
                className="h-10 w-auto"
              />
              <h1 className="text-xl font-bold text-foreground">
                Sistema de Asignaciones
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <Button variant="outline" onClick={onLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'manual', label: 'Asignación Manual', available: true },
              { id: 'automatic', label: 'Asignación Automática', available: false },
              { id: 'reports', label: 'Reporte de Asignaciones', available: false }
            ].map(tab => (
              <button
                key={tab.id}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => {
                  if (tab.available) {
                    setActiveTab(tab.id as any);
                  } else {
                    showComingSoon(tab.label);
                  }
                }}
              >
                {tab.label}
                {!tab.available && (
                  <Badge variant="warning-light" className="ml-2 text-xs">
                    Próximamente
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderTabContent()}
      </main>
    </div>
  );
};