<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import SEO from '$lib/components/SEO.svelte';
  import Card from '$lib/components/Card.svelte';
  import InfiniteScroll from '$lib/components/InfiniteScroll.svelte';
  import { pianteStore, type PianteFilters } from '$lib/stores/pianteStore';
  
  // Stato locale per i filtri di ricerca
  let searchQuery = '';
  let floweringFilter = true || false; // Non usato in questa pagina, ma può essere utile in futuro
  let wateringFilter = '';
  let edibleFilter = true; // Forza il filtro per piante commestibili
  let indoorFilter = false || true; // Non usato in questa pagina, ma può essere utile in futuro
  
  // SEO data
  const seoData = {
  title: 'Orto e Piante Commestibili - Coltiva il tuo orto domestico',
  description: 'Scopri la nostra selezione di piante commestibili per il tuo orto. Verdure, erbe aromatiche e piante da frutto per coltivare cibo fresco e genuino a casa tua.',
  keywords: 'orto domestico, piante commestibili, verdure da coltivare, erbe aromatiche, piante da frutto, orto in vaso, orto sul balcone, coltivazione biologica',
  ogImage: '/images/hero-background.png',
  ogType: 'website',
  canonicalUrl: $page.url.href
};


  $: console.log($pianteStore.piante);
  
  // Funzione per applicare i filtri
  function applyFilters() {
    const filters: PianteFilters = {
      search: searchQuery || undefined,
      flowers: floweringFilter || undefined,
      watering: wateringFilter || undefined,
      edible: edibleFilter || undefined, // Forza il filtro per piante commestibili
      indoor: indoorFilter || undefined, // Non usato in questa pagina, ma può essere utile in futuro
    //  page: 1 // Reset to page 1 when applying new filters
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
  
  // Funzione per caricare più piante (infinite scroll)
  function loadMorePlants() {
    pianteStore.loadMorePiante();
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
   // floweringFilter = url.searchParams.get('flowers') === 'true';
    wateringFilter = url.searchParams.get('watering') || '';
    
    // Prepara i filtri iniziali basati sui parametri URL
    const initialFilters: PianteFilters = {
      search: searchQuery || undefined,
      flowers: floweringFilter,
      watering: wateringFilter,
      edible: edibleFilter || undefined, // Forza il filtro per piante commestibili
     indoor: indoorFilter || undefined, // Non usato in questa pagina, ma può essere utile in futuro
      page: 1,
      limit: 20
    };
    
    // Carica le piante commestibili con i filtri iniziali usando l'endpoint dedicato
    pianteStore.fetchEdiblePlants(initialFilters);
  
  });
</script>

<SEO {...seoData} />

<div class="bg-green-50 py-12">
  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-serif font-bold text-emerald-800 mb-4 text-center">Orto e commestibili</h1>
    
    <p class="text-gray-600 text-center max-w-3xl mx-auto mb-8">
      Crea il tuo orto domestico con le nostre piante commestibili selezionate.
  Coltiva verdure fresche, erbe aromatiche e piante da frutto per portare sapori genuini direttamente sulla tua tavola.
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
            placeholder="Cerca piante commestibili..." 
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
          Mostrando {$pianteStore.piante.length} di {$pianteStore.pagination.total} piante commestibili
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
            image={pianta.image || '/plants/missing_image.jpg'}
            imageAlt={pianta.commonName}
            link={`/piante/dettaglio/${pianta.id}`}
            linkText="Vedi dettagli →"
            watering={pianta.watering}
            sunlight={pianta.sunlight || []}
            indoor={pianta.indoor || null || false}
            flowers={pianta.flowers || false}
            medicinal={pianta.medicinal || false}
            edible={pianta.edible || null || false}
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