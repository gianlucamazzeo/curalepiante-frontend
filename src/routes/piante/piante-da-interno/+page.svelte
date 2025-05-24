<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import SEO from '$lib/components/SEO.svelte';
  import Card from '$lib/components/Card.svelte';
  import { pianteStore, type PianteFilters } from '$lib/stores/pianteStore';
  
  // Stato locale per i filtri di ricerca
  let searchQuery = '';
  let floweringFilter = false;
  let wateringFilter = '';
  
  // SEO data
  const seoData = {
    title: 'Piante da Interno - Piante perfette per la tua casa',
    description: 'Scopri la nostra selezione di piante da interno. Filtra per esigenze di luce, acqua e trova la pianta perfetta per abbellire i tuoi spazi interni.',
    keywords: 'piante da interno, piante casa, piante appartamento, piante decorative',
    ogImage: '/images/pianta-da-interno.png',
    ogType: 'website',
    canonicalUrl: $page.url.href
  };

  $: console.log($pianteStore.piante);
  
  // Funzione per applicare i filtri
  function applyFilters() {
    const filters: PianteFilters = {
      search: searchQuery || undefined,
      indoor: true, // Forza il filtro per piante da interno
      flowers: floweringFilter || undefined,
      watering: wateringFilter || undefined,
      page: 1 // Reset to page 1 when applying new filters
    };
    
    pianteStore.setFilters(filters);
    
    // Aggiorna l'URL con i parametri di ricerca (opzionale)
    const url = new URL(window.location.href);
    
    if (searchQuery) url.searchParams.set('search', searchQuery);
    else url.searchParams.delete('search');
    
    if (floweringFilter) url.searchParams.set('flowers', 'true');
    else url.searchParams.delete('flowers');
    
    if (wateringFilter) url.searchParams.set('watering', wateringFilter);
    else url.searchParams.delete('watering');
    
    window.history.replaceState({}, '', url.toString());
  }
  
  // Funzione per cambiare pagina
  function goToPage(page: number) {
    pianteStore.goToPage(page);
    
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Funzione per tradurre il valore di watering
  function translateWatering(watering: string): string {
    const translations: Record<string, string> = {
      'frequent': 'Frequente',
      'average': 'Media',
      'minimum': 'Minima',
      'none': 'Nessuna'
    };
    return translations[watering] || watering;
  }
  
  onMount(() => {
    // Estrai i parametri di ricerca dall'URL (se presenti)
    const url = new URL(window.location.href);
    searchQuery = url.searchParams.get('search') || '';
    floweringFilter = url.searchParams.get('flowers') === 'true';
    wateringFilter = url.searchParams.get('watering') || '';
    
    // Prepara i filtri iniziali basati sui parametri URL
    const initialFilters: PianteFilters = {
      search: searchQuery || undefined,
      indoor: true, // Forza il filtro per piante da interno
      flowers: floweringFilter || undefined,
      watering: wateringFilter || undefined,
      page: 1,
      limit: 20
    };
    
    // Carica le piante con i filtri iniziali
    pianteStore.fetchPiante('piante-da-interno', initialFilters);
  
  });
</script>

<SEO {...seoData} />

<div class="bg-green-50 py-12">
  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-serif font-bold text-emerald-800 mb-4 text-center">Piante da Interno</h1>
    
    <p class="text-gray-600 text-center max-w-3xl mx-auto mb-8">
      Le piante da interno sono perfette per decorare e purificare l'aria della tua casa o del tuo ufficio.
      Scopri la nostra selezione di piante che crescono bene in ambienti chiusi e con luce limitata.
    </p>
    
    <!-- Filtri di ricerca -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="searchQuery" class="block text-sm font-medium text-gray-700 mb-1">Ricerca</label>
          <input 
            id="searchQuery"
            type="text" 
            bind:value={searchQuery} 
            placeholder="Cerca piante da interno..." 
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>
        
        <fieldset class="flex flex-col space-y-2">
          <legend class="block text-sm font-medium text-gray-700 mb-1">Tipo di pianta</legend>
          <div class="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="flowering" 
              bind:checked={floweringFilter} 
              class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded transition-colors"
            />
            <label for="flowering" class="text-gray-700">Piante da fiore</label>
          </div>
        </fieldset>
        
        <div>
          <label for="wateringFilter" class="block text-sm font-medium text-gray-700 mb-1">Esigenza di acqua</label>
          <select 
            id="wateringFilter"
            bind:value={wateringFilter} 
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            <option value="">Tutte</option>
            <option value="frequent">Frequente</option>
            <option value="average">Media</option>
            <option value="minimum">Minima</option>
            <option value="none">Nessuna</option>
          </select>
        </div>
      </div>
      
      <div class="mt-4">
        <button 
          on:click={applyFilters} 
          class="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Applica filtri
        </button>
      </div>
    </div>
    
    <!-- Risultati della ricerca -->
    {#if $pianteStore.isLoading}
      <div class="flex justify-center py-16">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded-full bg-emerald-600 animate-bounce" style="animation-delay: 0s"></div>
          <div class="w-4 h-4 rounded-full bg-emerald-600 animate-bounce" style="animation-delay: 0.2s"></div>
          <div class="w-4 h-4 rounded-full bg-emerald-600 animate-bounce" style="animation-delay: 0.4s"></div>
        </div>
      </div>
    {:else if $pianteStore.error}
      <div class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-md my-8 text-center">
        <p class="font-medium text-lg mb-2">Si è verificato un errore</p>
        <p>Non è stato possibile caricare le piante. Riprova più tardi.</p>
      </div>
    {:else if $pianteStore.piante.length === 0}
      <div class="bg-yellow-50 border border-yellow-200 text-yellow-700 p-6 rounded-md my-8 text-center">
        <p class="font-medium text-lg mb-2">Nessuna pianta trovata</p>
        <p>Non ci sono piante da interno che corrispondono ai filtri selezionati. Prova a modificare i criteri di ricerca.</p>
      </div>
    {:else}
      <!-- Informazioni sui risultati -->
      <div class="mb-6 text-gray-600">
        <p>
          Mostrando {($pianteStore.pagination.currentPage - 1) * $pianteStore.pagination.perPage + 1} - 
          {Math.min($pianteStore.pagination.currentPage * $pianteStore.pagination.perPage, $pianteStore.pagination.total)} 
          di {$pianteStore.pagination.total} piante da interno
        </p>
      </div>
      
      <!-- Grid delle piante -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {#each $pianteStore.piante as pianta}
          <Card 
            title={pianta.commonName}
            description={`${pianta.scientificName[0] || ''}`}
            image={pianta.image?.thumbnail || '/images/plants/missing_image.jpg'}
            imageAlt={pianta.commonName}
            link={`/piante/dettaglio/${pianta.id}`}
            linkText="Vedi dettagli →"
          />
        {/each}
      </div>
      
      <!-- Paginazione -->
      {#if $pianteStore.pagination.totalPages > 1}
        <div class="flex justify-center mt-12 mb-6">
          <nav class="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <!-- Pulsante Precedente -->
            {#if $pianteStore.pagination.currentPage > 1}
              <button 
                on:click={() => goToPage($pianteStore.pagination.currentPage - 1)}
                class="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-emerald-600 hover:bg-emerald-50"
              >
                <span class="sr-only">Precedente</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            {:else}
              <span class="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed">
                <span class="sr-only">Precedente</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </span>
            {/if}
            
            <!-- Pagine numeriche -->
            {#each Array.from({ length: Math.min(5, $pianteStore.pagination.totalPages) }, (_, i) => {
              // Calcola i numeri di pagina da visualizzare (max 5)
              let pageNum;
              const currentPage = $pianteStore.pagination.currentPage;
              const totalPages = $pianteStore.pagination.totalPages;
              
              if (totalPages <= 5) {
                // Se ci sono 5 o meno pagine, mostra tutte le pagine
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                // Se siamo all'inizio, mostra le prime 5 pagine
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                // Se siamo alla fine, mostra le ultime 5 pagine
                pageNum = totalPages - 4 + i;
              } else {
                // Altrimenti, mostra 2 pagine prima e 2 dopo la pagina corrente
                pageNum = currentPage - 2 + i;
              }
              
              return pageNum;
            }) as pageNum}
              <button 
                on:click={() => goToPage(pageNum)}
                class={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium 
                  ${pageNum === $pianteStore.pagination.currentPage 
                    ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600' 
                    : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {pageNum}
              </button>
            {/each}
            
            <!-- Pulsante Successiva -->
            {#if $pianteStore.pagination.currentPage < $pianteStore.pagination.totalPages}
              <button 
                on:click={() => goToPage($pianteStore.pagination.currentPage + 1)}
                class="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-emerald-600 hover:bg-emerald-50"
              >
                <span class="sr-only">Successiva</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            {:else}
              <span class="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed">
                <span class="sr-only">Successiva</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </span>
            {/if}
          </nav>
        </div>
      {/if}
    {/if}
  </div>
</div>