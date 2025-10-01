import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "@/components/Login";
import { AsignacionesManuales } from "@/components/AsignacionesManuales";
import { SeleccionarTecnico } from "@/components/SeleccionarTecnico";
import { getAuthState, logout } from "@/lib/auth";

const queryClient = new QueryClient();

type AppView = 'login' | 'dashboard' | 'select-technician';

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication state on app start
  useEffect(() => {
    const authState = getAuthState();
    if (authState.isAuthenticated && !authState.isLocked) {
      setIsAuthenticated(true);
      setCurrentView('dashboard');
    } else {
      setIsAuthenticated(false);
      setCurrentView('login');
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setCurrentView('login');
    setSelectedOrderId(null);
  };

  const handleSelectTechnician = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('select-technician');
  };

  const handleBackToDashboard = () => {
    setSelectedOrderId(null);
    setCurrentView('dashboard');
  };

  const handleAssignmentComplete = () => {
    // Return to dashboard after successful assignment
    setSelectedOrderId(null);
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} />;
      
      case 'dashboard':
        return (
          <AsignacionesManuales
            onSelectTechnician={handleSelectTechnician}
            onLogout={handleLogout}
          />
        );
      
      case 'select-technician':
        if (!selectedOrderId) {
          // If no order is selected, go back to dashboard
          setCurrentView('dashboard');
          return null;
        }
        return (
          <SeleccionarTecnico
            orderId={selectedOrderId}
            onBack={handleBackToDashboard}
            onAssignmentComplete={handleAssignmentComplete}
          />
        );
      
      default:
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-background">
          {renderCurrentView()}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;