// TelcoNova Support Suite - Login Component
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { attemptLogin, getAuthState, formatLockoutTime } from '@/lib/auth';
import { useToastNotifications } from '@/components/ui/toast-container';
import logoImage from '@/assets/logo.png';
import { DarkModeToggle } from '@/components/DarkModeToggle';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState<string>('');
  
  const { addToast, ToastContainer } = useToastNotifications();

  // Check for existing lockout on component mount
  useEffect(() => {
    const authState = getAuthState();
    if (authState.isLocked && authState.lockoutUntil) {
      startCountdown(authState.lockoutUntil);
    }
  }, []);

  const startCountdown = (lockoutUntil: number) => {
    const updateCountdown = () => {
      const remaining = formatLockoutTime(lockoutUntil);
      if (remaining === '00:00') {
        setLockoutCountdown('');
        return false; // Stop interval
      }
      setLockoutCountdown(remaining);
      return true; // Continue interval
    };

    // Initial update
    if (updateCountdown()) {
      const interval = setInterval(() => {
        if (!updateCountdown()) {
          clearInterval(interval);
        }
      }, 1000);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email.trim()) {
      addToast({
        type: 'error',
        title: 'Error de validación',
        description: 'El correo electrónico es requerido'
      });
      return;
    }

    if (!validateEmail(email)) {
      addToast({
        type: 'error',
        title: 'Error de validación',
        description: 'El formato del correo electrónico no es válido'
      });
      return;
    }

    if (!password.trim()) {
      addToast({
        type: 'error',
        title: 'Error de validación',
        description: 'La contraseña es requerida'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = attemptLogin(email.trim(), password);
      
      if (result.success) {
        addToast({
          type: 'success',
          title: result.message,
          description: 'Redirigiendo al panel principal...'
        });
        
        // Wait a moment to show success message before redirecting
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        if (result.isLocked && result.lockoutUntil) {
          startCountdown(result.lockoutUntil);
        }
        
        addToast({
          type: 'error',
          title: 'Error de autenticación',
          description: result.message
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error del sistema',
        description: 'Ocurrió un error inesperado. Por favor intente nuevamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || !!lockoutCountdown;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ToastContainer />
      
      {/* Dark Mode Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-primary gradient-animate opacity-5" />
      
      <Card className="w-full max-w-md relative animate-slide-in-up">
        <CardHeader className="text-center pb-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src={logoImage} 
              alt="TelcoNova Support Suite"
              className="h-20 w-auto"
            />
          </div>
          
          <CardTitle className="text-2xl font-bold text-foreground">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="supervisor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isFormDisabled}
                  className="pl-10 focus-ring"
                  autoComplete="email"
                  aria-describedby="email-error"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isFormDisabled}
                  className="pl-10 pr-10 focus-ring"
                  autoComplete="current-password"
                  aria-describedby="password-error"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isFormDisabled}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Lockout Warning */}
            {lockoutCountdown && (
              <div className="flex items-center gap-2 p-3 bg-destructive-light border border-destructive rounded-md">
                <Shield className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive font-medium">
                  Cuenta bloqueada. Tiempo restante: {lockoutCountdown}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              variant={lockoutCountdown ? "outline" : "gradient"}
              size="lg"
              disabled={isFormDisabled}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Verificando...
                </>
              ) : lockoutCountdown ? (
                'Cuenta Bloqueada'
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center font-medium mb-2">
                Credenciales de prueba:
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Email: supervisor@example.com<br />
                Contraseña: Admin123.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
