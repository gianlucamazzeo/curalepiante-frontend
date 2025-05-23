// src/routes/piante/piante-da-interno/page.svelte.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';
import { pianteStore } from '$lib/stores/pianteStore';

// Mock SvelteKit's page store
vi.mock('$app/stores', () => {
  return {
    page: {
      subscribe: (fn: any) => {
        fn({ url: new URL('http://localhost:5173/piante/piante-da-interno') });
        return () => {};
      }
    }
  };
});

// Mock the piano store
vi.mock('$lib/stores/pianteStore', () => {
  const mockPianteStore = {
    subscribe: vi.fn(),
    fetchPiante: vi.fn(),
    setFilters: vi.fn(),
    goToPage: vi.fn()
  };
  return { pianteStore: mockPianteStore };
});

describe('Piante da Interno Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up default mock implementation for subscribe
    pianteStore.subscribe.mockImplementation((callback) => {
      callback({
        piante: [],
        isLoading: false,
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          total: 0,
          perPage: 20
        },
        filters: {}
      });
      return () => {};
    });
  });

  it('renders the page title correctly', () => {
    render(Page);
    expect(screen.getByText('Piante da Interno')).toBeInTheDocument();
  });

  it('fetches indoor plants on mount', () => {
    render(Page);
    expect(pianteStore.fetchPiante).toHaveBeenCalledWith('piante-da-interno', expect.objectContaining({ indoor: true }));
  });

  it('shows loading state when store is loading', () => {
    pianteStore.subscribe.mockImplementation((callback) => {
      callback({
        piante: [],
        isLoading: true,
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          total: 0,
          perPage: 20
        },
        filters: {}
      });
      return () => {};
    });
    
    render(Page);
    expect(screen.getByText(/Mostrando/)).not.toBeInTheDocument();
  });

  it('shows empty state when no plants are found', () => {
    pianteStore.subscribe.mockImplementation((callback) => {
      callback({
        piante: [],
        isLoading: false,
        error: null,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          total: 0,
          perPage: 20
        },
        filters: {}
      });
      return () => {};
    });
    
    render(Page);
    expect(screen.getByText('Nessuna pianta trovata')).toBeInTheDocument();
  });
});