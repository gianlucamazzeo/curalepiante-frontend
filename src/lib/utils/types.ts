// src/lib/utils/types.ts - Svelte 5 Ready

// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  _id: string;
  email: string;
  ruolo: 'ADMIN' | 'USER';
  nome?: string;
  cognome?: string;
  attivo: boolean;
  ultimoAccesso?: Date;
  dataCreazione: Date;
  dataModifica?: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  message: string;
  timestamp: string;
  statusCode: number;
}

export interface AuthVerifyResponse {
  success: boolean;
  data: User;
  message: string;
  timestamp: string;
  statusCode: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  statusCode: number;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// ============================================
// PERMISSION TYPES
// ============================================

export type Permission = 
  | 'articles.read'
  | 'articles.write'
  | 'articles.delete'
  | 'plants.read'
  | 'plants.write'
  | 'plants.delete'
  | 'affiliate-products.read'
  | 'affiliate-products.write'
  | 'affiliate-products.delete'
  | 'users.read'
  | 'users.write'
  | 'users.delete'
  | 'dashboard.view'
  | 'settings.manage';

export interface Role {
  name: string;
  permissions: Permission[];
}

// ============================================
// SVELTE 5 RUNE TYPES
// ============================================

// Type helpers per le runes
export type StateType<T> = {
  current: T;
  set: (value: T) => void;
  update: (updater: (value: T) => T) => void;
};

export type DerivedType<T> = {
  current: T;
};

// ============================================
// CONTENT TYPES
// ============================================

export interface Article {
  _id: string;
  titolo: string;
  contenuto: string;
  categoria: string;
  stato: 'bozza' | 'pubblicato';
  dataCreazione: Date;
  dataModifica: Date;
  autore: string;
  slug?: string;
  immagineCopertina?: string;
  tags?: string[];
}

export interface PlantAdmin {
  _id: string;
  nome: string;
  nomeComune: string;
  famiglia: string;
  tipoTerritorio: string;
  difficoltaColtivazione: 'facile' | 'media' | 'difficile';
  dataCreazione: Date;
  dataModifica: Date;
  descrizione?: string;
  immagine?: string;
  curaNecessaria?: string[];
}

export interface AffiliateProduct {
  _id: string;
  nome: string;
  categoria: string;
  prezzo: number;
  commissione: number;
  attivo: boolean;
  dataCreazione: Date;
  dataModifica: Date;
  descrizione?: string;
  immagine?: string;
  linkAcquisto: string;
  marca?: string;
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}

// ============================================
// FORM & VALIDATION TYPES
// ============================================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'number' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: unknown) => string | null;
  disabled?: boolean;
  multiple?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ============================================
// TABLE TYPES
// ============================================

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  render?: (value: unknown, row: T) => string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableConfig<T> {
  columns: TableColumn<T>[];
  searchable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  selectable?: boolean;
  actions?: TableAction<T>[];
}

export interface TableAction<T> {
  label: string;
  icon?: string;
  action: (row: T) => void;
  condition?: (row: T) => boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalArticles: number;
  totalPlants: number;
  totalAffiliateProducts: number;
  totalUsers: number;
  publishedArticles: number;
  activeUsers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: 'article' | 'plant' | 'affiliate-product' | 'user';
  resourceId: string;
  description: string;
  timestamp: Date;
  user: {
    id: string;
    email: string;
    nome?: string;
  };
}

// ============================================
// UTILITY TYPES
// ============================================

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

// ============================================
// FETCH OPTIONS TYPE
// ============================================

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
  token?: string;
}