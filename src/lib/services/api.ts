const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Wrapper generico per fetch con gestione errori
 */
async function fetchWithErrorHandling<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
	data: {
		id: number;
		common_name: string;
		scientific_name: string[];
		other_name: string[];
		cycle: string;
		watering: string;
		sunlight: string[];
		default_image: PiantaImmagine | null;
	};
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
	image: PiantaImmagine | null;
}

// Funzione di mappatura dal DTO al modello dell'app per Pianta
function mapPianta(dto: PiantaDTO): Pianta {
	return {
		id: dto.data.id,
		commonName: dto.data.common_name,
		scientificName: dto.data.scientific_name,
		otherNames: dto.data.other_name,
		cycle: dto.data.cycle,
		watering: dto.data.watering,
		sunlight: dto.data.sunlight,
		image: dto.data.default_image
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

		const response = await fetchWithErrorHandling<PaginatedPianteResponse<PiantaDTO>>(endpoint);

		return {
			piante: response.data.map(mapPianta),
			pagination: {
				currentPage: response.current_page,
				totalPages: response.last_page,
				total: response.total,
				perPage: response.per_page
			}
		};
	},

	getById: async (id: number): Promise<Pianta> => {
		const response = await fetchWithErrorHandling<PiantaDTO>(`/api/piante/${id}`);
		return mapPianta(response);
	},

	getByCategory: async (
		categorySlug: string,
		params: Record<string, unknown> = {}
	): Promise<{
		piante: Pianta[];
		pagination: { currentPage: number; totalPages: number; total: number; perPage: number };
	}> => {
		// Per le piante da interno, impostiamo il filtro indoor=1
		//  const isIndoor = categorySlug === 'piante-da-interno';

		// Costruisci la query string dai parametri
		const queryParams = new URLSearchParams();

		// Aggiungi i parametri alla query string
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				queryParams.append(key, String(value));
			}
		}

		// Aggiungi il filtro per piante da interno se necessario
		//  if (isIndoor) {
		//    queryParams.append('indoor', '1');
		//  }

		const queryString = queryParams.toString();
		const endpoint = queryString ? `/api/piante?${queryString}` : '/api/piante';

		const response = await fetchWithErrorHandling<PaginatedPianteResponse<PiantaDTO>>(endpoint);

		return {
			piante: response.data.map(mapPianta),
			pagination: {
				currentPage: response.current_page,
				totalPages: response.last_page,
				total: response.total,
				perPage: response.per_page
			}
		};
	}
};

// Esporta tutti i servizi API
export const apiService = {
	categorie: categorieAPI,
	piante: pianteAPI
};
