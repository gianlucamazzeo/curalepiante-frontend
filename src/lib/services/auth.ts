// src/lib/services/auth.ts - Svelte 5 Ready

import { browser } from '$app/environment';
import type { 
  LoginCredentials, 
  LoginResponse, 
  AuthVerifyResponse, 
  ApiResponse,
  FetchOptions,
  User 
} from '$lib/utils/types.js';

// ============================================
// CONFIGURAZIONE
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'admin_token';
const USER_KEY = import.meta.env.VITE_USER_KEY || 'admin_user';

// Log condizionale per development
function devLog(message: string, ...args: unknown[]): void {
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
    console.log(`[AUTH] ${message}`, ...args);
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Fetch con gestione errori e autenticazione automatica
 */
async function fetchWithAuth<T>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<T> {
  const token = getStoredToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Risposta del server non valida');
    }

    const data = await response.json();

    if (!response.ok) {
      // Se il token è scaduto o non valido, pulisci lo storage
      if (response.status === 401) {
        clearAuthStorage();
      }
      
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Errore di connessione al server');
    }
    
    throw error;
  }
}

/**
 * Gestione dello storage del token
 */
function getStoredToken(): string | null {
  if (!browser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string): void {
  if (!browser) return;
  localStorage.setItem(TOKEN_KEY, token);
}

function getStoredUser(): User | null {
  if (!browser) return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

function setStoredUser(user: User): void {
  if (!browser) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuthStorage(): void {
  if (!browser) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ============================================
// AUTH SERVICE
// ============================================

export class AuthService {
  
  /**
   * Effettua il login dell'utente
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      devLog('🔐 Tentativo di login per:', credentials.email);
      
      const response = await fetchWithAuth<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.data.token && response.data.user) {
        // Salva token e user nello storage
        setStoredToken(response.data.token);
        setStoredUser(response.data.user);
        
        console.log('✅ Login effettuato con successo');
        return response;
      } else {
        throw new Error('Risposta di login non valida');
      }
    } catch (error) {
      console.error('❌ Errore durante il login:', error);
      throw error;
    }
  }

  /**
   * Verifica la validità del token corrente
   */
  static async verifyToken(): Promise<AuthVerifyResponse> {
    try {
      const token = getStoredToken();
      
      if (!token) {
        throw new Error('Nessun token trovato');
      }

      console.log('🔍 Verifica validità token...');
      
      const response = await fetchWithAuth<AuthVerifyResponse>('/auth/verify');
      
      if (response.success && response.data) {
        // Aggiorna i dati utente nello storage
        setStoredUser(response.data);
        console.log('✅ Token valido');
        return response;
      } else {
        throw new Error('Token non valido');
      }
    } catch (error) {
      console.error('❌ Verifica token fallita:', error);
      clearAuthStorage();
      throw error;
    }
  }

  /**
   * Effettua il logout dell'utente
   */
  static async logout(): Promise<void> {
    try {
      console.log('🚪 Logout in corso...');
      
      // Tenta di chiamare l'endpoint di logout sul server
      try {
        await fetchWithAuth<ApiResponse<null>>('/auth/logout', {
          method: 'POST',
        });
      } catch (error) {
        // Se l'endpoint fallisce, continuiamo comunque con il logout locale
        console.warn('⚠️ Errore durante logout server-side:', error);
      }
      
      // Pulisci sempre lo storage locale
      clearAuthStorage();
      console.log('✅ Logout completato');
    } catch (error) {
      console.error('❌ Errore durante logout:', error);
      // Anche in caso di errore, pulisci lo storage
      clearAuthStorage();
      throw error;
    }
  }

  /**
   * Ottiene il token corrente
   */
  static getToken(): string | null {
    return getStoredToken();
  }

  /**
   * Ottiene l'utente corrente dallo storage
   */
  static getCurrentUser(): User | null {
    return getStoredUser();
  }

  /**
   * Verifica se l'utente è autenticato
   */
  static isAuthenticated(): boolean {
    const token = getStoredToken();
    const user = getStoredUser();
    return !!(token && user);
  }

  /**
   * Verifica se l'utente ha un ruolo specifico
   */
  static hasRole(role: string): boolean {
    const user = getStoredUser();
    return user?.ruolo === role;
  }

  /**
   * Verifica se l'utente è admin
   */
  static isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Verifica se l'utente è attivo
   */
  static isActiveUser(): boolean {
    const user = getStoredUser();
    return user?.attivo === true;
  }

  /**
   * Pulisce tutti i dati di autenticazione
   */
  static clearAuth(): void {
    clearAuthStorage();
  }

  /**
   * Controlla se il token è scaduto (controllo locale approssimativo)
   */
  static isTokenExpired(): boolean {
    const token = getStoredToken();
    if (!token) return true;

    try {
      // Decodifica JWT payload senza verifica (solo per check locale)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const { exp } = JSON.parse(jsonPayload);
      const currentTime = Date.now() / 1000;
      
      return exp < currentTime;
    } catch {
      // Se non riusciamo a decodificare, consideriamo il token scaduto
      return true;
    }
  }

  /**
   * Forza un refresh del token (richiama verify)
   */
  static async refreshAuth(): Promise<User | null> {
    try {
      const response = await this.verifyToken();
      return response.data;
    } catch {
      this.clearAuth();
      return null;
    }
  }

  /**
   * Utility per ottenere headers con autenticazione
   */
  static getAuthHeaders(): Record<string, string> {
    const token = getStoredToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default AuthService;