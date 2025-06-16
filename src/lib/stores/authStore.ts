// src/lib/stores/authStore.ts - Store Classico per Svelte 5

import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import AuthService from '$lib/services/auth.js';
import type { 
  AuthState, 
  User, 
  LoginCredentials,
  Permission 
} from '$lib/utils/types.js';

// ============================================
// INITIAL STATE
// ============================================

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// ============================================
// SVELTE STORES (Classic approach)
// ============================================

// Store principale
export const authState = writable<AuthState>(initialState);

// Stores derivati per accesso facilitato
export const user = derived(authState, ($auth) => $auth.user);
export const isAuthenticated = derived(authState, ($auth) => $auth.isAuthenticated);
export const isLoading = derived(authState, ($auth) => $auth.isLoading);
export const authError = derived(authState, ($auth) => $auth.error);
export const isAdmin = derived(user, ($user) => $user?.ruolo === 'ADMIN');
export const token = derived(authState, ($auth) => $auth.token);

// ============================================
// PERMISSION SYSTEM
// ============================================

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    'articles.read', 'articles.write', 'articles.delete',
    'plants.read', 'plants.write', 'plants.delete',
    'affiliate-products.read', 'affiliate-products.write', 'affiliate-products.delete',
    'users.read', 'users.write', 'users.delete',
    'dashboard.view', 'settings.manage'
  ],
  USER: [
    'articles.read',
    'plants.read',
    'affiliate-products.read'
  ]
};

export const userPermissions = derived(user, ($user) => {
  if (!$user) return [];
  return ROLE_PERMISSIONS[$user.ruolo] || [];
});

// ============================================
// ACTIONS
// ============================================

class AuthStoreManager {
  
  static async initialize(): Promise<void> {
    console.log('🔄 [INIT] Inizio inizializzazione authStore...');
    
    if (!browser) {
      console.log('🔄 [INIT] Non siamo nel browser, skip inizializzazione');
      authState.update(state => ({ ...state, isLoading: false }));
      return;
    }

    try {
      console.log('🔄 [INIT] Siamo nel browser, controllo autenticazione...');
      
      if (AuthService.isAuthenticated()) {
        console.log('🔄 [INIT] Token trovato, verifico validità...');
        authState.update(state => ({ ...state, isLoading: true, error: null }));
        
        try {
          const response = await AuthService.verifyToken();
          console.log('✅ [INIT] Token valido, risposta:', response);
          AuthStoreManager.setAuthenticated(response.data, AuthService.getToken()!);
          console.log('✅ [INIT] Autenticazione ripristinata con successo');
        } catch (verifyError) {
          console.error('❌ [INIT] Errore verifica token:', verifyError);
          // Se la verifica fallisce, pulisci e continua
          AuthService.clearAuth();
          AuthStoreManager.setUnauthenticated();
        }
      } else {
        console.log('ℹ️ [INIT] Nessun token salvato');
        AuthStoreManager.setUnauthenticated();
      }
    } catch (error) {
      console.error('❌ [INIT] Errore durante inizializzazione:', error);
      AuthStoreManager.setError(error instanceof Error ? error.message : 'Errore di autenticazione');
      AuthStoreManager.clearAuth();
    } finally {
      console.log('🏁 [INIT] Inizializzazione completata, setting isLoading = false');
      authState.update(state => ({ ...state, isLoading: false }));
    }
  }

  static async login(credentials: LoginCredentials): Promise<void> {
    try {
      authState.update(state => ({ ...state, isLoading: true, error: null }));
      
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        AuthStoreManager.setAuthenticated(response.data.user, response.data.token);
        await goto('/admin', { replaceState: true });
      } else {
        throw new Error(response.message || 'Login fallito');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante il login';
      AuthStoreManager.setError(errorMessage);
      throw error;
    } finally {
      authState.update(state => ({ ...state, isLoading: false }));
    }
  }

  static async logout(): Promise<void> {
    try {
      authState.update(state => ({ ...state, isLoading: true, error: null }));
      
      await AuthService.logout();
      AuthStoreManager.clearAuth();
      
      await goto('/admin/login', { replaceState: true });
    } catch (error) {
      console.error('❌ Errore durante logout:', error);
      AuthStoreManager.clearAuth();
      await goto('/admin/login', { replaceState: true });
    } finally {
      authState.update(state => ({ ...state, isLoading: false }));
    }
  }

  static async verifyAuth(): Promise<boolean> {
    try {
      if (!AuthService.isAuthenticated()) {
        return false;
      }

      const response = await AuthService.verifyToken();
      AuthStoreManager.setAuthenticated(response.data, AuthService.getToken()!);
      return true;
    } catch (error) {
      console.error('❌ Verifica auth fallita:', error);
      AuthStoreManager.clearAuth();
      return false;
    }
  }

  static async refreshUser(): Promise<void> {
    try {
      const userData = await AuthService.refreshAuth();
      if (userData) {
        authState.update(state => ({ ...state, user: userData, error: null }));
      } else {
        AuthStoreManager.clearAuth();
      }
    } catch (error) {
      console.error('❌ Refresh utente fallito:', error);
      AuthStoreManager.setError('Errore durante l\'aggiornamento dei dati utente');
    }
  }

  static hasPermission(permission: Permission): boolean {
    // Dobbiamo fare get del store
    let permissions: Permission[] = [];
    userPermissions.subscribe(value => permissions = value)();
    return permissions.includes(permission);
  }

  static hasRole(role: string): boolean {
    let currentUser: User | null = null;
    user.subscribe(value => currentUser = value)();
    return currentUser?.ruolo === role;
  }

  static isAdminUser(): boolean {
    return this.hasRole('ADMIN');
  }

  static clearError(): void {
    authState.update(state => ({ ...state, error: null }));
  }

  // Helper methods
  private static setAuthenticated(userData: User, tokenValue: string): void {
    authState.update(state => ({
      ...state,
      user: userData,
      token: tokenValue,
      isAuthenticated: true,
      error: null,
    }));
  }

  private static setUnauthenticated(): void {
    authState.update(state => ({
      ...state,
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    }));
  }

  private static setError(error: string): void {
    authState.update(state => ({
      ...state,
      error,
      isLoading: false,
    }));
  }

  private static clearAuth(): void {
    AuthService.clearAuth();
    AuthStoreManager.setUnauthenticated();
  }
}

// ============================================
// AUTO-INITIALIZATION
// ============================================

if (browser) {
  AuthStoreManager.initialize();
}

// ============================================
// EXPORTED ACTIONS
// ============================================

export const authActions = {
  initialize: AuthStoreManager.initialize,
  login: AuthStoreManager.login,
  logout: AuthStoreManager.logout,
  verifyAuth: AuthStoreManager.verifyAuth,
  refreshUser: AuthStoreManager.refreshUser,
  hasPermission: AuthStoreManager.hasPermission,
  hasRole: AuthStoreManager.hasRole,
  isAdmin: AuthStoreManager.isAdminUser,
  clearError: AuthStoreManager.clearError,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function requireAuth(): boolean {
  let currentState: AuthState;
  authState.subscribe(state => currentState = state)();
  
  if (!currentState!.isAuthenticated) {
    goto('/admin/login');
    return false;
  }
  
  return true;
}

export function requirePermission(permission: Permission): boolean {
  if (!requireAuth()) return false;
  
  const hasPermission = AuthStoreManager.hasPermission(permission);
  
  if (!hasPermission) {
    console.warn(`❌ Permesso negato: ${permission}`);
    return false;
  }
  
  return true;
}

export function requireAdmin(): boolean {
  if (!requireAuth()) return false;
  
  const isAdminUser = AuthStoreManager.isAdminUser();
  
  if (!isAdminUser) {
    console.warn('❌ Accesso negato: richiesto ruolo ADMIN');
    goto('/admin/login');
    return false;
  }
  
  return true;
}

// ============================================
// DEFAULT EXPORT (for easier imports)
// ============================================

export default {
  // Stores
  authState,
  user,
  isAuthenticated,
  isLoading,
  authError,
  token,
  userPermissions,
  
  // Actions
  ...authActions,
  
  // Utilities
  requireAuth,
  requirePermission,
  requireAdmin,
};

// Named exports per import specifici
