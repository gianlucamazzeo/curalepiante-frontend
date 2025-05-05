const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Wrapper generico per fetch con gestione errori
 */
async function fetchWithErrorHandling<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      throw new Error(`Errore API: ${response.status} ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('Errore nella chiamata API:', error);
    throw error;
  }
}

// Interfaccia per la risposta API standard
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  error: string | null;
  timestamp: string;
  path: string;
}

// Interfaccia per la risposta paginata
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Interfaccia per la categoria come viene restituita dall'API
export interface CategoriaDTO {
  _id: string;
  nome: string;
  slug: string;
  descrizione: string;
  ordine: number;
  attiva: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Interfaccia per la categoria come la usiamo nell'app
export interface Categoria {
  id: string;
  nome: string;
  slug: string;
  descrizione?: string;
  ordine: number;
  attiva: boolean;
}

// Funzione di mappatura dal DTO al modello dell'app
function mapCategoria(dto: CategoriaDTO): Categoria {
  return {
    id: dto._id,
    nome: dto.nome,
    slug: dto.slug,
    descrizione: dto.descrizione,
    ordine: dto.ordine,
    attiva: dto.attiva
  };
}

// Servizio categorie aggiornato
export const categorieAPI = {
  getAll: async (): Promise<Categoria[]> => {
    const response = await fetchWithErrorHandling<ApiResponse<PaginatedResponse<CategoriaDTO>>>('/categorie');
    
    // Estrai le categorie dalla risposta annidata, mappale e ordinale
    return response.data.data
      .filter(cat => cat.attiva)
      .map(mapCategoria)
      .sort((a, b) => a.ordine - b.ordine);
  },
  
  getById: async (id: string): Promise<Categoria> => {
    const response = await fetchWithErrorHandling<ApiResponse<CategoriaDTO>>(`/categorie/${id}`);
    return mapCategoria(response.data);
  }
};

// Esporta altri servizi API secondo necessità
export const apiService = {
  categorie: categorieAPI,
  // altri servizi...
};