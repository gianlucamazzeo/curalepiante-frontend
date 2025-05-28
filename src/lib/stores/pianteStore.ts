// src/lib/stores/pianteStore.ts
import { writable, get } from 'svelte/store';
import type { Pianta } from '$lib/services/api';
import { apiService } from '$lib/services/api';

// Interfaccia per i filtri di ricerca piante
export interface PianteFilters {
  search?: string;
  indoor?: boolean;
  flowers?: boolean;
  watering?: string;
  edible?: boolean;
  page?: number;
  limit?: number;
}

// Interfaccia per la paginazione
export interface PiantePagination {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

// Interfaccia dello store
interface PianteStoreState {
  piante: Pianta[];
  isLoading: boolean;
  error: Error | null;
  pagination: PiantePagination;
  filters: PianteFilters;
  categorySlug: string | null;
  lastFetched: number | null;
}

// Stato iniziale
const initialState: PianteStoreState = {
  piante: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    total: 0,
    perPage: 20
  },
  filters: {
    page: 1,
    limit: 20
  },
  categorySlug: null,
  lastFetched: null
};

// Tempo di validità della cache in millisecondi (1 ora)
const CACHE_EXPIRY_TIME = 60 * 60 * 1000;

// Funzione per salvare dati nella localStorage
function saveToLocalStorage(key: string, data: unknown, timestamp: number) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp
      }));
    } catch (e) {
      console.error(`Errore durante il salvataggio di ${key} nella localStorage:`, e);
    }
  }
}

// Funzione per leggere dati dalla localStorage
function getFromLocalStorage(key: string, expiry = CACHE_EXPIRY_TIME) {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const data = parsedCache.data;
        const timestamp = parsedCache.timestamp;
        const now = Date.now();
        
        if (data && timestamp && (now - timestamp) < expiry) {
          console.log(`Usando ${key} dalla localStorage (cache valida)`);
          return { data, timestamp };
        }
      }
    } catch (e) {
      console.error(`Errore durante la lettura di ${key} dalla localStorage:`, e);
    }
  }
  return null;
}

// Funzione per creare una chiave di cache in base ai filtri e alla categoria
function createCacheKey(categorySlug: string | null, filters: PianteFilters): string {
  const category = categorySlug || 'all';
  const filterString = JSON.stringify(filters);
  return `piante_${category}_${filterString}`;
}

// Crea uno store writable
function createPianteStore() {
  const { subscribe, update, set } = writable<PianteStoreState>(initialState);
  
  const store = {
    subscribe,
    
    // Metodo per recuperare le piante in base ai filtri e alla categoria
    fetchPiante: async (
      categorySlug: string | null = null, 
      filters: PianteFilters = {}, 
      forceRefresh = false
    ) => {
      console.log(`Recupero piante per categoria: ${categorySlug}, filtri:`, filters);


      update(state => ({ 
        ...state, 
        isLoading: true, 
        error: null, 
        categorySlug,
        filters: { ...state.filters, ...filters }
      }));
      
      const cacheKey = createCacheKey(categorySlug, filters);
      const now = Date.now();
      
      // Verifica se ci sono dati validi in localStorage
      if (!forceRefresh) {
        const cached = getFromLocalStorage(cacheKey);
        if (cached) {
          const { data, timestamp } = cached;
          update(state => ({ 
            ...state, 
            piante: data.piante, 
            pagination: data.pagination,
            isLoading: false,
            lastFetched: timestamp
          }));
          return;
        }
      }
      
      try {
        // Prepara i parametri di query
        const queryParams: Record<string, string | number | boolean> = {
          page: filters.page || 1,
          limit: filters.limit || 20
        };
        
        // Aggiungi i filtri alla query
        if (filters.search) queryParams.search = filters.search;
        if (filters.indoor !== undefined) queryParams.indoor = filters.indoor ? 1 : 0;
        if (filters.flowers !== undefined) queryParams.flowers = filters.flowers ? 1 : 0;
        if (filters.edible !== undefined) queryParams.edible = filters.edible ? 1 : 0;
        if (filters.watering) queryParams.watering = filters.watering;
        
        // Esegui la chiamata API appropriata in base alla categoria
        let response;
        if (categorySlug) {
          response = await apiService.piante.getByCategory(categorySlug, queryParams);
        } else {
          response = await apiService.piante.getAll(queryParams);
        }
        
        update(state => ({ 
          ...state, 
          piante: response.piante, 
          pagination: response.pagination,
          isLoading: false,
          lastFetched: now
        }));
        
        // Salva nella localStorage per persistenza
        saveToLocalStorage(cacheKey, response, now);
      } catch (error) {
        console.error('Errore nel recupero delle piante:', error);
        update(state => ({ 
          ...state, 
          error: error instanceof Error ? error : new Error('Errore sconosciuto'), 
          isLoading: false 
        }));
      }
    },
    
    // Metodo per impostare i filtri e ricaricare le piante
    setFilters: (filters: PianteFilters) => {
      const currentState = get({ subscribe });
      return store.fetchPiante(
        currentState.categorySlug, 
        { ...currentState.filters, ...filters, page: 1 } // Reset to page 1 when changing filters
      );
    },
    
    // Metodo per cambiare pagina
    goToPage: (page: number) => {
      const currentState = get({ subscribe });
      return store.fetchPiante(
        currentState.categorySlug, 
        { ...currentState.filters, page }
      );
    },
    
    // Metodo per invalidare manualmente la cache
    invalidateCache: (categorySlug: string | null = null, filters: PianteFilters = {}) => {
      const cacheKey = createCacheKey(categorySlug, filters);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(cacheKey);
      }
      console.log(`Cache delle piante (${cacheKey}) invalidata manualmente`);
    },
    
    // Metodo per resettare lo store
    reset: () => set(initialState)
  };
  
  return store;
}

// Esporta lo store come singleton
export const pianteStore = createPianteStore();