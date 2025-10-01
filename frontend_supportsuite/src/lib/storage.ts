// TelcoNova Support Suite - Data Storage Management
import { mockTechnicians, mockOrders, type Technician, type Order } from './mockData';

const TECHNICIANS_STORAGE_KEY = 'telcoNova_technicians';
const ORDERS_STORAGE_KEY = 'telcoNova_orders';

// Technician Management
export function getTechnicians(): Technician[] {
  try {
    const stored = localStorage.getItem(TECHNICIANS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Technician[];
    }
  } catch (error) {
    console.error('Error reading technicians from storage:', error);
  }
  
  // Return default data if nothing stored or error occurred
  const defaultData = [...mockTechnicians];
  saveTechnicians(defaultData);
  return defaultData;
}

export function saveTechnicians(technicians: Technician[]): void {
  try {
    localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(technicians));
  } catch (error) {
    console.error('Error saving technicians to storage:', error);
  }
}

export function getTechnicianById(id: string): Technician | undefined {
  const technicians = getTechnicians();
  return technicians.find(tech => tech.id === id);
}

export function updateTechnicianWorkload(technicianId: string, newWorkload: number): void {
  const technicians = getTechnicians();
  const index = technicians.findIndex(tech => tech.id === technicianId);
  
  if (index !== -1) {
    technicians[index].carga = Math.max(0, Math.min(5, newWorkload)); // Ensure 0-5 range
    saveTechnicians(technicians);
  }
}

// Order Management
export function getOrders(): Order[] {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Order[];
    }
  } catch (error) {
    console.error('Error reading orders from storage:', error);
  }
  
  // Return default data if nothing stored or error occurred
  const defaultData = [...mockOrders];
  saveOrders(defaultData);
  return defaultData;
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving orders to storage:', error);
  }
}

export function getOrderById(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find(order => order.id === id);
}

export function createOrder(orderData: Omit<Order, 'id' | 'creadoEn'>): Order {
  const orders = getOrders();
  
  // Generate new order ID
  const maxId = Math.max(
    ...orders.map(order => parseInt(order.id.replace('O-', '')) || 1000),
    1000
  );
  const newId = `O-${maxId + 1}`;
  
  const newOrder: Order = {
    ...orderData,
    id: newId,
    creadoEn: new Date().toISOString()
  };
  
  orders.push(newOrder);
  saveOrders(orders);
  
  return newOrder;
}

export function assignOrderToTechnician(orderId: string, technicianId: string): boolean {
  const orders = getOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) return false;
  
  const order = orders[orderIndex];
  const previousTechnicianId = order.assignedTo;
  
  // Update order assignment
  orders[orderIndex].assignedTo = technicianId;
  saveOrders(orders);
  
  // Update technician workloads
  if (previousTechnicianId) {
    // Reassignment: decrease previous technician's workload
    const previousTech = getTechnicianById(previousTechnicianId);
    if (previousTech) {
      updateTechnicianWorkload(previousTechnicianId, previousTech.carga - 1);
    }
  }
  
  // Increase new technician's workload
  const newTech = getTechnicianById(technicianId);
  if (newTech) {
    updateTechnicianWorkload(technicianId, newTech.carga + 1);
  }
  
  return true;
}

export function unassignOrder(orderId: string): boolean {
  const orders = getOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) return false;
  
  const order = orders[orderIndex];
  const technicianId = order.assignedTo;
  
  if (technicianId) {
    // Decrease technician's workload
    const technician = getTechnicianById(technicianId);
    if (technician) {
      updateTechnicianWorkload(technicianId, technician.carga - 1);
    }
  }
  
  // Remove assignment from order
  orders[orderIndex].assignedTo = undefined;
  saveOrders(orders);
  
  return true;
}

// Search and Filter Functions
export function searchOrders(query: string): Order[] {
  if (!query.trim()) return getOrders();
  
  const orders = getOrders();
  const searchTerm = query.toLowerCase().trim();
  
  return orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm) ||
    order.servicio.toLowerCase().includes(searchTerm) ||
    order.descripcion.toLowerCase().includes(searchTerm) ||
    order.zona.toLowerCase().includes(searchTerm)
  );
}

export interface TechnicianFilters {
  zones?: string[];
  specialties?: string[];
  maxWorkload?: number;
  availability?: string[];
  searchQuery?: string;
}

export function filterTechnicians(filters: TechnicianFilters): Technician[] {
  let technicians = getTechnicians();
  
  // Apply search query
  if (filters.searchQuery?.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    technicians = technicians.filter(tech =>
      tech.nombre.toLowerCase().includes(query) ||
      tech.email.toLowerCase().includes(query) ||
      tech.telefono.includes(query)
    );
  }
  
  // Filter by zones
  if (filters.zones && filters.zones.length > 0) {
    technicians = technicians.filter(tech =>
      filters.zones!.includes(tech.zona)
    );
  }
  
  // Filter by specialties
  if (filters.specialties && filters.specialties.length > 0) {
    technicians = technicians.filter(tech =>
      filters.specialties!.includes(tech.especialidad)
    );
  }
  
  // Filter by maximum workload
  if (filters.maxWorkload !== undefined) {
    technicians = technicians.filter(tech =>
      tech.carga <= filters.maxWorkload!
    );
  }
  
  // Filter by availability
  if (filters.availability && filters.availability.length > 0) {
    technicians = technicians.filter(tech =>
      filters.availability!.some(timeBlock =>
        tech.disponibilidad.includes(timeBlock)
      )
    );
  }
  
  // Sort by workload (ascending - least loaded first)
  return technicians.sort((a, b) => a.carga - b.carga);
}

// Utility function to reset all data to initial state (for development)
export function resetAllData(): void {
  try {
    localStorage.removeItem(TECHNICIANS_STORAGE_KEY);
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    console.log('All data reset to initial state');
  } catch (error) {
    console.error('Error resetting data:', error);
  }
}

// Export for debugging/development
export const developmentUtils = {
  resetAllData,
  getTechnicians,
  getOrders,
  saveTechnicians,
  saveOrders
};