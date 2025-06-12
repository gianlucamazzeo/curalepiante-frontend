<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import SEO from '$lib/components/SEO.svelte';
  import Card from '$lib/components/Card.svelte';
  import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
  import { pianteStore, type PianteFilters } from '$lib/stores/pianteStore';
  
  // Stato locale per i filtri di ricerca
  let searchQuery = '';
  
  // SEO data
  const seoData = {
    title: 'Piante da Esterno - Piante perfette per il tuo giardino',
    description: 'Scopri la nostra selezione di piante da esterno. Filtra per esigenze di luce, acqua e trova la pianta perfetta per abbellire i tuoi spazi esterni.',
    keywords: 'piante da esterno, piante giardino, piante balcone, piante terrazzo, giardinaggio',
    ogImage: '/images/hero-background.png',
    ogType: 'website',
    canonicalUrl: $page.url.href
  };

  // Funzione per applicare i filtri
  function applyFilters() {
    const filters: PianteFilters = {
      search: searchQuery || undefined,
      page: 1 // Reset to page 1 when applying new filters
    };
    
    pianteStore.setFilters(filters);
    
    // Aggiorna l'URL con i parametri di ricerca (opzionale)
    const url = new URL(window.location.href);
    
    if (searchQuery) url.searchParams.set('search', searchQuery);
    else url.searchParams.delete('search');
    
    window.history.replaceState({}, '', url.toString());
  }
  
  // Funzione per caricare più piante (infinite scroll)
  function loadMorePlants() {
    pianteStore.loadMorePiante();
  }
  
  onMount(() => {
    // Estrai i parametri di ricerca dall'URL (se presenti)
    const url = new URL(window.location.href);
    searchQuery = url.searchParams.get('search') || '';
    
    // Prepara i filtri iniziali basati sui parametri URL
    const initialFilters: PianteFilters = {
      search: searchQuery || undefined,
      page: 1,
      limit: 20
    };
    
    // Carica le piante con i filtri iniziali usando l'endpoint dedicato per le piante da esterno
    pianteStore.fetchOutdoorPlants(initialFilters);
  
  });
</script>

<SEO {...seoData} />

<div class="bg-green-50 py-12">
  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-serif font-bold text-emerald-800 mb-4 text-center">Piante da Esterno</h1>
    
    <p class="text-gray-600 text-center max-w-3xl mx-auto mb-8">
      Le piante da esterno sono perfette per decorare il tuo giardino, balcone o terrazzo.
      Scopri la nostra selezione di piante che prosperano all'aria aperta e con luce solare diretta.
    </p>
    
    <!-- Filtri di ricerca -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label for="searchQuery" class="block text-sm font-medium text-gray-700 mb-1">Ricerca</label>
          <input 
            id="searchQuery"
            type="text" 
            bind:value={searchQuery} 
            placeholder="Cerca piante da esterno..." 
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            on:keydown={(e) => e.key === 'Enter' && applyFilters()}
          />
        </div>
      </div>
      
      <div class="mt-4">
        <button 
          on:click={applyFilters} 
          class="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Cerca
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
        <p>Non ci sono piante da esterno che corrispondono ai filtri selezionati. Prova a modificare i criteri di ricerca.</p>
      </div>
    {:else}
      <!-- Informazioni sui risultati -->
      <div class="mb-6 text-gray-600">
        <p>
          Mostrando {$pianteStore.piante.length} di {$pianteStore.pagination.total} piante da esterno
          {#if $pianteStore.hasMore}
            <span class="text-emerald-600">(scorri per vederne altre)</span>
          {/if}
        </p>
      </div>
      
      <!-- Grid delle piante -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {#each $pianteStore.piante as pianta}
          <Card 
            title={pianta.commonName}
            description={`${pianta.scientificName || ''}`}
            image={pianta.image || '/images/plants/missing_image.jpg'}
            imageAlt={pianta.commonName}
            link={`/piante/dettaglio/${pianta.id}`}
            linkText="Vedi dettagli →"
            watering={pianta.watering}
            sunlight={pianta.sunlight || []}
            indoor={pianta.indoor || null || false}
            flowers={pianta.flowers || false}
            medicinal={pianta.medicinal || false}
            edible={false}
          />
        {/each}
      </div>
      
      <!-- Infinite Scroll -->
      <InfiniteScroll 
        hasMore={$pianteStore.hasMore}
        isLoading={$pianteStore.isLoadingMore}
        onLoadMore={loadMorePlants}
      />
    {/if}
  </div>
</div>