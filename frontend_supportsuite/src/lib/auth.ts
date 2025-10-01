// TelcoNova Support Suite - Authentication Management
import { mockSupervisor, type AuthAttempt } from './mockData';

const AUTH_STORAGE_KEY = 'telcoNova_auth';
const ATTEMPTS_STORAGE_KEY = 'telcoNova_auth_attempts';
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export interface AuthState {
  isAuthenticated: boolean;
  user?: {
    email: string;
    nombre: string;
  };
  isLocked: boolean;
  lockoutUntil?: number;
  attemptCount: number;
}

export interface LoginResult {
  success: boolean;
  message: string;
  isLocked?: boolean;
  lockoutUntil?: number;
}

// Get current auth state from localStorage
export function getAuthState(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    const attempts = getFailedAttempts();
    
    if (stored) {
      const parsed = JSON.parse(stored) as AuthState;
      
      // Check if still locked out
      if (parsed.isLocked && parsed.lockoutUntil) {
        const now = Date.now();
        if (now >= parsed.lockoutUntil) {
          // Lockout expired, clear it
          const clearedState = { ...parsed, isLocked: false, lockoutUntil: undefined, attemptCount: 0 };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(clearedState));
          clearFailedAttempts();
          return clearedState;
        }
      }
      
      return { ...parsed, attemptCount: attempts.length };
    }
  } catch (error) {
    console.error('Error reading auth state:', error);
  }
  
  return {
    isAuthenticated: false,
    isLocked: false,
    attemptCount: getFailedAttempts().length
  };
}

// Save auth state to localStorage
function saveAuthState(state: AuthState): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
}

// Get failed login attempts from localStorage
function getFailedAttempts(): AuthAttempt[] {
  try {
    const stored = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AuthAttempt[];
    }
  } catch (error) {
    console.error('Error reading failed attempts:', error);
  }
  return [];
}

// Save failed login attempts to localStorage
function saveFailedAttempts(attempts: AuthAttempt[]): void {
  try {
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.error('Error saving failed attempts:', error);
  }
}

// Clear failed login attempts
function clearFailedAttempts(): void {
  try {
    localStorage.removeItem(ATTEMPTS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing failed attempts:', error);
  }
}

// Record a failed login attempt
function recordFailedAttempt(): void {
  const attempts = getFailedAttempts();
  const now = Date.now();
  
  // Add new failed attempt
  attempts.push({ timestamp: now, success: false });
  
  // Keep only attempts from the last hour (to prevent infinite accumulation)
  const oneHourAgo = now - (60 * 60 * 1000);
  const recentAttempts = attempts.filter(attempt => attempt.timestamp > oneHourAgo);
  
  saveFailedAttempts(recentAttempts);
}

// Check if account should be locked
function shouldLockAccount(): boolean {
  const attempts = getFailedAttempts();
  const now = Date.now();
  const fifteenMinutesAgo = now - LOCKOUT_DURATION;
  
  // Count failed attempts in the last 15 minutes
  const recentFailedAttempts = attempts.filter(attempt => 
    !attempt.success && attempt.timestamp > fifteenMinutesAgo
  );
  
  return recentFailedAttempts.length >= MAX_ATTEMPTS;
}

// Attempt to login with credentials
export function attemptLogin(email: string, password: string): LoginResult {
  const currentState = getAuthState();
  
  // Check if account is currently locked
  if (currentState.isLocked && currentState.lockoutUntil) {
    const now = Date.now();
    if (now < currentState.lockoutUntil) {
      const remainingTime = new Date(currentState.lockoutUntil).toLocaleTimeString();
      return {
        success: false,
        message: `Cuenta temporalmente bloqueada. Intente de nuevo a las ${remainingTime}`,
        isLocked: true,
        lockoutUntil: currentState.lockoutUntil
      };
    }
  }
  
  // Validate credentials
  const isValid = email === mockSupervisor.email && password === mockSupervisor.password;
  
  if (isValid) {
    // Successful login - clear failed attempts and update state
    clearFailedAttempts();
    const newState: AuthState = {
      isAuthenticated: true,
      user: {
        email: mockSupervisor.email,
        nombre: mockSupervisor.nombre
      },
      isLocked: false,
      attemptCount: 0
    };
    saveAuthState(newState);
    
    return {
      success: true,
      message: "Autenticación exitosa"
    };
  } else {
    // Failed login - record attempt and check for lockout
    recordFailedAttempt();
    
    if (shouldLockAccount()) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION;
      const lockoutTime = new Date(lockoutUntil).toLocaleTimeString();
      
      const lockedState: AuthState = {
        isAuthenticated: false,
        isLocked: true,
        lockoutUntil,
        attemptCount: MAX_ATTEMPTS
      };
      saveAuthState(lockedState);
      
      return {
        success: false,
        message: `Cuenta temporalmente bloqueada. Intente de nuevo a las ${lockoutTime}`,
        isLocked: true,
        lockoutUntil
      };
    } else {
      const attempts = getFailedAttempts();
      const remainingAttempts = MAX_ATTEMPTS - attempts.length;
      
      return {
        success: false,
        message: `Autenticación fallida: revise el correo electrónico o la contraseña. ${remainingAttempts} intento(s) restante(s).`
      };
    }
  }
}

// Logout user
export function logout(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    clearFailedAttempts();
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

// Utility to format remaining lockout time
export function formatLockoutTime(lockoutUntil: number): string {
  const now = Date.now();
  const remaining = lockoutUntil - now;
  
  if (remaining <= 0) return '00:00';
  
  const minutes = Math.floor(remaining / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
