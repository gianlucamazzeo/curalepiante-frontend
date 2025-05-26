const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

// Import mock data
import mockData from './mockData.json';

/**
 * Funzione per ottenere dati mock
 */
async function getMockData<T>(endpoint: string): Promise<T> {
	// Simula un piccolo delay per simulare una chiamata di rete
	await new Promise(resolve => setTimeout(resolve, 200));
	
	// Mappa gli endpoint ai dati mock appropriati
	const mockMap: Record<string, any> = {
		'/categorie': mockData.categorie,
		'/api/piante': mockData.piante,
		'/api/piante?indoor=true': mockData.piante_da_interno,
		'/api/piante?indoor=false': mockData.piante_da_esterno
	};
	
	// Gestisci endpoint con parametri di query
	let mockKey = endpoint;
	if (endpoint.includes('/api/piante')) {
		if (endpoint.includes('indoor=true')) {
			mockKey = '/api/piante?indoor=true';
		} else if (endpoint.includes('indoor=false')) {
			mockKey = '/api/piante?indoor=false';
		} else {
			mockKey = '/api/piante';
		}
	}
	
	const data = mockMap[mockKey];
	if (!data) {
		throw new Error(`Mock data non trovato per endpoint: ${endpoint}`);
	}
	
	return data as T;
}

/**
 * Wrapper generico per fetch con gestione errori
 */
async function fetchWithErrorHandling<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	// Se USE_MOCK_DATA è true, usa i dati mock
	if (USE_MOCK_DATA) {
		return getMockData<T>(endpoint);
	}
	
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

		return (await response.json()) as T;
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

// Interfaccia per la risposta paginata delle piante
export interface PaginatedPianteResponse<T> {
	data: T[];
	to: number;
	per_page: number;
	current_page: number;
	from: number;
	last_page: number;
	total: number;
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

// Interfaccia per l'immagine di una pianta
export interface PiantaImmagine {
	license: number;
	license_name: string;
	license_url: string;
	original_url: string;
	regular_url: string;
	medium_url: string;
	small_url: string;
	thumbnail: string;
}

// Interfaccia per una pianta come restituita dall'API
export interface PiantaDTO {
	id: number;
	common_name: string;
	scientific_name: string[];
	other_name: string[];
	cycle: string;
	watering: string;
	sunlight: string[];
	indoor: boolean;
	flowers: boolean;
	fruits: boolean;
	cuisine: boolean;
	medicinal: boolean;
	poisonous_to_pets: boolean;
	pruning_count: number;
	default_image: PiantaImmagine | null;
}

// Interfaccia per una pianta come la usiamo nell'app
export interface Pianta {
	id: number;
	commonName: string;
	scientificName: string[];
	otherNames: string[];
	cycle: string;
	watering: string;
	sunlight: string[];
	indoor: boolean;
	flowers: boolean;
	fruits: boolean;
	cuisine: boolean;
	medicinal: boolean;
	poisonousToPets: boolean;
	pruningCount: number;
	image: PiantaImmagine | null;
}

// Funzione di mappatura dal DTO al modello dell'app per Pianta
function mapPianta(dto: PiantaDTO): Pianta {
	return {
		id: dto.id,
		commonName: dto.common_name,
		scientificName: dto.scientific_name,
		otherNames: dto.other_name,
		cycle: dto.cycle,
		watering: dto.watering,
		sunlight: dto.sunlight,
		indoor: dto.indoor,
		flowers: dto.flowers,
		fruits: dto.fruits,
		cuisine: dto.cuisine,
		medicinal: dto.medicinal,
		poisonousToPets: dto.poisonous_to_pets,
		pruningCount: dto.pruning_count,
		image: dto.default_image
	};
}

// Funzione di mappatura dal DTO al modello dell'app per Categoria
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
		const response =
			await fetchWithErrorHandling<ApiResponse<PaginatedResponse<CategoriaDTO>>>('/categorie');

		// Estrai le categorie dalla risposta annidata, mappale e ordinale
		return response.data.data
			.filter((cat) => cat.attiva)
			.map(mapCategoria)
			.sort((a, b) => a.ordine - b.ordine);
	},

	getById: async (id: string): Promise<Categoria> => {
		const response = await fetchWithErrorHandling<ApiResponse<CategoriaDTO>>(`/categorie/${id}`);
		return mapCategoria(response.data);
	}
};

// Servizio piante
export const pianteAPI = {
	getAll: async (
		params: Record<string, unknown> = {}
	): Promise<{
		piante: Pianta[];
		pagination: { currentPage: number; totalPages: number; total: number; perPage: number };
	}> => {
		// Costruisci la query string dai parametri
		const queryParams = new URLSearchParams();

		// Aggiungi i parametri alla query string
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				queryParams.append(key, String(value));
			}
		}

		const queryString = queryParams.toString();
		const endpoint = queryString ? `/api/piante?${queryString}` : '/api/piante';

		// CORREZIONE: La risposta è wrappata in ApiResponse
		const response =
			await fetchWithErrorHandling<ApiResponse<PaginatedPianteResponse<PiantaDTO>>>(endpoint);

		// Debug: Log the response structure
		console.log('API Response:', response);
		console.log('Piante data:', response.data.data);

		return {
			// CORREZIONE: Accedi ai dati attraverso response.data.data
			piante: Array.isArray(response.data.data) ? response.data.data.map(mapPianta) : [],
			pagination: {
				currentPage: response.data.current_page,
				totalPages: response.data.last_page,
				total: response.data.total,
				perPage: response.data.per_page
			}
		};
	},

	getById: async (id: number): Promise<Pianta> => {
		// Per singola pianta, potrebbe essere diverso - verifica la struttura
		const response = await fetchWithErrorHandling<ApiResponse<PiantaDTO>>(`/api/piante/${id}`);
		return mapPianta(response.data);
	},

	getByCategory: async (
		categorySlug: string,
		params: Record<string, unknown> = {}
	): Promise<{
		piante: Pianta[];
		pagination: { currentPage: number; totalPages: number; total: number; perPage: number };
	}> => {
		// Costruisci la query string dai parametri
		const queryParams = new URLSearchParams();

		// Aggiungi i parametri alla query string
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				queryParams.append(key, String(value));
			}
		}

		const queryString = queryParams.toString();
		const endpoint = queryString ? `/api/piante?${queryString}` : '/api/piante';

		// CORREZIONE: La risposta è wrappata in ApiResponse
		const response =
			await fetchWithErrorHandling<ApiResponse<PaginatedPianteResponse<PiantaDTO>>>(endpoint);

		// Debug: Log the response structure
		console.log('API Response:', response);
		console.log('Piante data:', response.data.data);

		return {
			
			piante: Array.isArray(response.data.data) ? response.data.data.map(mapPianta) : [],
			pagination: {
				currentPage: response.data.current_page,
				totalPages: response.data.last_page,
				total: response.data.total,
				perPage: response.data.per_page
			}
		};
	}
};

// Esporta tutti i servizi API
export const apiService = {
	categorie: categorieAPI,
	piante: pianteAPI
};
