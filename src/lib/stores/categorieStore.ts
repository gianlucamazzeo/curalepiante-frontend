// src/lib/stores/categorieStore.ts
import { writable, get } from 'svelte/store';
import type { Categoria } from '$lib/services/api';
import { apiService } from '$lib/services/api';

// Interfaccia dello store
interface CategorieStoreState {
  categorie: Categoria[];
  isLoading: boolean;
  error: Error | null;
  lastFetched: number | null; // Timestamp dell'ultimo caricamento
}

// Stato iniziale
const initialState: CategorieStoreState = {
  categorie: [],
  isLoading: false,
  error: null,
  lastFetched: null
};

// Tempo di validità della cache in millisecondi (24 ore)
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; 

// Crea uno store writable
function createCategorieStore() {
  const { subscribe, update, set } = writable<CategorieStoreState>(initialState);
  
  const store = {
    subscribe,
    
    fetchCategorie: async (forceRefresh = false) => {
      console.log('Verifica se è necessario recuperare le categorie...');
      
      // Ottieni lo stato attuale dello store
      const currentState = get({ subscribe });
      const now = Date.now();
      
      // Verifica se i dati sono già in cache e ancora validi
      const isCacheValid = 
        !forceRefresh && 
        currentState.categorie.length > 0 && 
        currentState.lastFetched && 
        (now - currentState.lastFetched) < CACHE_EXPIRY_TIME;
      
      // Se la cache è valida, non fare niente
      if (isCacheValid) {
        console.log('Usando categorie già in memoria (cache valida)');
        return;
      }
      
      // Verifica se ci sono dati validi in localStorage
      if (!forceRefresh && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('categorie');
          if (cached) {
            const parsedCache = JSON.parse(cached);
            const data = parsedCache.data;
            const timestamp = parsedCache.timestamp;
            
            if (data && timestamp && (now - timestamp) < CACHE_EXPIRY_TIME) {
              console.log('Usando categorie dalla localStorage (cache valida)');
              update(state => ({
                ...state,
                categorie: data,
                lastFetched: timestamp
              }));
              return; // Esce senza fare chiamata API
            }
          }
        } catch (e) {
          console.error('Errore durante la lettura della cache:', e);
        }
      }
      
      // Se arriviamo qui, dobbiamo fare una chiamata API
      console.log('Recupero categorie dal server...');
      update(state => ({ ...state, isLoading: true, error: null }));
      
      try {
        const categorie = await apiService.categorie.getAll();
        update(state => ({ 
          ...state, 
          categorie,
          isLoading: false,
          lastFetched: now
        }));
        
        // Salva nella localStorage per persistenza tra refresh
        if (typeof window !== 'undefined') {
          localStorage.setItem('categorie', JSON.stringify({
            data: categorie,
            timestamp: now
          }));
          console.log('Categorie salvate in localStorage');
        }
      } catch (error) {
        console.error('Errore nel recupero delle categorie:', error);
        update(state => ({ 
          ...state, 
          error: error instanceof Error ? error : new Error('Errore sconosciuto'), 
          isLoading: false 
        }));
      }
    },
    
    // Metodo per invalidare manualmente la cache
    invalidateCache: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('categorie');
      }
      console.log('Cache delle categorie invalidata manualmente');
      set(initialState);
    },
    
    reset: () => set(initialState)
  };
  
  return store;
}

// Esporta lo store come singleton
export const categorieStore = createCategorieStore();