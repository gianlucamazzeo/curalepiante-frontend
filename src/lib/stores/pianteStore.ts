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
  isLoadingMore: boolean; // Nuovo: per distinguere caricamento iniziale da caricamento infinite scroll
  error: Error | null;
  pagination: PiantePagination;
  filters: PianteFilters;
  categorySlug: string | null;
  lastFetched: number | null;
  hasMore: boolean; // Nuovo: indica se ci sono altre piante da caricare
}

// Stato iniziale
const initialState: PianteStoreState = {
  piante: [],
  isLoading: false,
  isLoadingMore: false,
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
  lastFetched: null,
  hasMore: true
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

      // Forza il filtro edible per la categoria orto-e-commestibili
      const finalFilters = { ...filters };
      if (categorySlug === 'orto-e-commestibili') {
        finalFilters.edible = true;
      }

      update(state => ({ 
        ...state, 
        isLoading: true, 
        error: null, 
        categorySlug,
        filters: { ...state.filters, ...finalFilters }
      }));
      
      const cacheKey = createCacheKey(categorySlug, finalFilters);
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
            lastFetched: timestamp,
            hasMore: data.pagination.currentPage < data.pagination.totalPages
          }));
          return;
        }
      }
      
      try {
        // Prepara i parametri di query
        const queryParams: Record<string, string | number | boolean> = {
          page: finalFilters.page || 1,
          limit: finalFilters.limit || 20
        };
        
        // Aggiungi i filtri alla query
        if (finalFilters.search) queryParams.search = finalFilters.search;
        if (finalFilters.indoor !== undefined) queryParams.indoor = finalFilters.indoor ? 1 : 0;
        if (finalFilters.flowers !== undefined) queryParams.flowers = finalFilters.flowers ? 1 : 0;
        if (finalFilters.edible !== undefined) queryParams.edible = finalFilters.edible ? 1 : 0;
        if (finalFilters.watering) queryParams.watering = finalFilters.watering;
        
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
          lastFetched: now,
          hasMore: response.pagination.currentPage < response.pagination.totalPages
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
      const newFilters = { ...currentState.filters, ...filters, page: 1 }; // Reset to page 1 when changing filters
      
      // Reset piante array e hasMore quando cambiano i filtri
      update(state => ({ 
        ...state, 
        piante: [],
        hasMore: true,
        filters: newFilters
      }));
      
      // Se siamo nella categoria orto-e-commestibili, usa l'endpoint dedicato
      if (currentState.categorySlug === 'orto-e-commestibili') {
        return store.fetchEdiblePlants(newFilters);
      }
      
      // Se siamo nella categoria piante-da-esterno, usa l'endpoint dedicato
      if (currentState.categorySlug === 'piante-da-esterno') {
        return store.fetchOutdoorPlants(newFilters);
      }
      
      // Se siamo nella categoria piante-da-interno, usa l'endpoint dedicato
      if (currentState.categorySlug === 'piante-da-interno') {
        return store.fetchIndoorPlants(newFilters);
      }
      
      return store.fetchPiante(currentState.categorySlug, newFilters);
    },
    
    // Metodo per cambiare pagina
    goToPage: (page: number) => {
      const currentState = get({ subscribe });
      const newFilters = { ...currentState.filters, page };
      
      // Se siamo nella categoria orto-e-commestibili, usa l'endpoint dedicato
      if (currentState.categorySlug === 'orto-e-commestibili') {
        return store.fetchEdiblePlants(newFilters);
      }
      
      // Se siamo nella categoria piante-da-esterno, usa l'endpoint dedicato
      if (currentState.categorySlug === 'piante-da-esterno') {
        return store.fetchOutdoorPlants(newFilters);
      }
      
      // Se siamo nella categoria piante-da-interno, usa l'endpoint dedicato
      if (currentState.categorySlug === 'piante-da-interno') {
        return store.fetchIndoorPlants(newFilters);
      }
      
      return store.fetchPiante(currentState.categorySlug, newFilters);
    },
    
    // Metodo per invalidare manualmente la cache
    invalidateCache: (categorySlug: string | null = null, filters: PianteFilters = {}) => {
      const cacheKey = createCacheKey(categorySlug, filters);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(cacheKey);
      }
      console.log(`Cache delle piante (${cacheKey}) invalidata manualmente`);
    },
    
    // Metodo per recuperare solo le piante commestibili
    fetchEdiblePlants: async (
      filters: PianteFilters = {}, 
      forceRefresh = false
    ) => {
      console.log('Recupero piante commestibili, filtri:', filters);

      update(state => ({ 
        ...state, 
        isLoading: true, 
        error: null, 
        categorySlug: 'orto-e-commestibili',
        filters: { ...state.filters, ...filters, edible: true }
      }));
      
      const cacheKey = createCacheKey('orto-e-commestibili', { ...filters, edible: true });
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
            lastFetched: timestamp,
            hasMore: data.pagination.currentPage < data.pagination.totalPages
          }));
          return;
        }
      }
      
      try {
        // Prepara i parametri di query (senza includere edible=true poiché l'endpoint è già specifico)
        const queryParams: Record<string, string | number | boolean> = {
          page: filters.page || 1,
          limit: filters.limit || 20
        };
        
        // Aggiungi solo il filtro di ricerca per le piante commestibili
        if (filters.search) queryParams.search = filters.search;
        
        // Usa l'endpoint dedicato per le piante commestibili
        const response = await apiService.piante.getEdible(queryParams);
        
        update(state => ({ 
          ...state, 
          piante: response.piante, 
          pagination: response.pagination,
          isLoading: false,
          lastFetched: now,
          hasMore: response.pagination.currentPage < response.pagination.totalPages
        }));
        
        // Salva nella localStorage per persistenza
        saveToLocalStorage(cacheKey, response, now);
      } catch (error) {
        console.error('Errore nel recupero delle piante commestibili:', error);
        update(state => ({ 
          ...state, 
          error: error instanceof Error ? error : new Error('Errore sconosciuto'), 
          isLoading: false 
        }));
      }
    },

    // Metodo per recuperare solo le piante da esterno
    fetchOutdoorPlants: async (
      filters: PianteFilters = {}, 
      forceRefresh = false
    ) => {
      console.log('Recupero piante da esterno, filtri:', filters);

      update(state => ({ 
        ...state, 
        isLoading: true, 
        error: null, 
        categorySlug: 'piante-da-esterno',
        filters: { ...state.filters, ...filters, indoor: false }
      }));
      
      const cacheKey = createCacheKey('piante-da-esterno', { ...filters, indoor: false });
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
            lastFetched: timestamp,
            hasMore: data.pagination.currentPage < data.pagination.totalPages
          }));
          return;
        }
      }
      
      try {
        // Prepara i parametri di query (senza includere indoor=false poiché l'endpoint è già specifico)
        const queryParams: Record<string, string | number | boolean> = {
          page: filters.page || 1,
          limit: filters.limit || 20
        };
        
        // Aggiungi solo il filtro di ricerca per le piante da esterno
        if (filters.search) queryParams.search = filters.search;
        
        // Usa l'endpoint dedicato per le piante da esterno
        const response = await apiService.piante.getOutdoor(queryParams);
        
        update(state => ({ 
          ...state, 
          piante: response.piante, 
          pagination: response.pagination,
          isLoading: false,
          lastFetched: now,
          hasMore: response.pagination.currentPage < response.pagination.totalPages
        }));
        
        // Salva nella localStorage per persistenza
        saveToLocalStorage(cacheKey, response, now);
      } catch (error) {
        console.error('Errore nel recupero delle piante da esterno:', error);
        update(state => ({ 
          ...state, 
          error: error instanceof Error ? error : new Error('Errore sconosciuto'), 
          isLoading: false 
        }));
      }
    },

    // Metodo per recuperare solo le piante da interno
    fetchIndoorPlants: async (
      filters: PianteFilters = {}, 
      forceRefresh = false
    ) => {
      console.log('Recupero piante da interno, filtri:', filters);

      update(state => ({ 
        ...state, 
        isLoading: true, 
        error: null, 
        categorySlug: 'piante-da-interno',
        filters: { ...state.filters, ...filters, indoor: true }
      }));
      
      const cacheKey = createCacheKey('piante-da-interno', { ...filters, indoor: true });
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
            lastFetched: timestamp,
            hasMore: data.pagination.currentPage < data.pagination.totalPages
          }));
          return;
        }
      }
      
      try {
        // Prepara i parametri di query
        const queryParams: Record<string, string | number | boolean> = {
          page: filters.page || 1,
          limit: filters.limit || 20,
          indoor: 1  // Forza il filtro per piante da interno
        };
        
        // Aggiungi solo il filtro di ricerca per le piante da interno
        if (filters.search) queryParams.search = filters.search;
        
        // Usa l'endpoint generico con il filtro indoor
        const response = await apiService.piante.getAll(queryParams);
        
        update(state => ({ 
          ...state, 
          piante: response.piante, 
          pagination: response.pagination,
          isLoading: false,
          lastFetched: now,
          hasMore: response.pagination.currentPage < response.pagination.totalPages
        }));
        
        // Salva nella localStorage per persistenza
        saveToLocalStorage(cacheKey, response, now);
      } catch (error) {
        console.error('Errore nel recupero delle piante da interno:', error);
        update(state => ({ 
          ...state, 
          error: error instanceof Error ? error : new Error('Errore sconosciuto'), 
          isLoading: false 
        }));
      }
    },

    // Metodo per caricare più piante (infinite scroll)
    loadMorePiante: async () => {
      const currentState = get({ subscribe });
      
      // Se stiamo già caricando o non ci sono più piante, non fare nulla
      if (currentState.isLoadingMore || !currentState.hasMore || currentState.isLoading) {
        return;
      }
      
      update(state => ({ 
        ...state, 
        isLoadingMore: true,
        error: null
      }));
      
      try {
        const nextPage = Number(currentState.pagination.currentPage) + 1;
        const filters = { ...currentState.filters, page: nextPage };
        
        // Prepara i parametri di query
        const queryParams: Record<string, string | number | boolean> = {
          page: nextPage,
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
        if (currentState.categorySlug === 'orto-e-commestibili') {
          response = await apiService.piante.getEdible(queryParams);
        } else if (currentState.categorySlug === 'piante-da-esterno') {
          response = await apiService.piante.getOutdoor(queryParams);
        } else if (currentState.categorySlug === 'piante-da-interno') {
          response = await apiService.piante.getAll(queryParams);
        } else if (currentState.categorySlug) {
          response = await apiService.piante.getByCategory(currentState.categorySlug, queryParams);
        } else {
          response = await apiService.piante.getAll(queryParams);
        }
        
        update(state => {
          const newPiante = [...state.piante, ...response.piante];
          const hasMore = response.pagination.currentPage < response.pagination.totalPages;
          
          
          return {
            ...state,
            piante: newPiante,
            pagination: response.pagination,
            isLoadingMore: false,
            hasMore,
            filters: { ...state.filters, page: nextPage }
          };
        });
        
      } catch (error) {
        console.error('Errore nel caricamento di più piante:', error);
        update(state => ({ 
          ...state, 
          error: error instanceof Error ? error : new Error('Errore sconosciuto'), 
          isLoadingMore: false 
        }));
      }
    },
    
    // Metodo per resettare lo store
    reset: () => set(initialState)
  };
  
  return store;
}

// Esporta lo store come singleton
export const pianteStore = createPianteStore();