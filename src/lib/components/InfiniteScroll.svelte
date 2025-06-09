<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  
  interface Props {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    threshold?: number; // Percentuale di distanza dal fondo per triggare il caricamento (default: 80%)
  }
  
  let { hasMore, isLoading, onLoadMore, threshold = 80 }: Props = $props();
  
  let scrollContainer: HTMLElement;
  let isMounted = false;
  
  // Calcola la distanza di trigger basata sul device
  const getTriggerDistance = $derived.by(() => {
    if (!isMounted) return 800;
    
    const viewportHeight = window.innerHeight;
    const isMobile = window.innerWidth < 768;
    
    // Su mobile usa una percentuale più alta della viewport per trigger più responsivo
    // Su desktop usa una distanza fissa più conservativa
    if (isMobile) {
      return Math.max(viewportHeight * 0.5, 400); // Almeno 50% della viewport o 400px
    } else {
      return Math.max(viewportHeight * 0.3, 600); // Almeno 30% della viewport o 600px
    }
  });
  
  function checkScroll() {
    if (!hasMore || isLoading) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    
    // Calcola la distanza dal fondo della pagina
    const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
    
    // Trigger il caricamento quando siamo vicini al fondo
    if (distanceFromBottom <= getTriggerDistance) {
      onLoadMore();
    }
  }
  
  function throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any) {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }
  
  // Throttled scroll handler per performance
  const throttledScrollHandler = throttle(checkScroll, 200);
  
  onMount(() => {
    isMounted = true;
    window.addEventListener('scroll', throttledScrollHandler);
    window.addEventListener('resize', throttledScrollHandler);
    
    // Check iniziale nel caso la pagina sia già scrollata
    checkScroll();
  });
  
  onDestroy(() => {
    window.removeEventListener('scroll', throttledScrollHandler);
    window.removeEventListener('resize', throttledScrollHandler);
  });
</script>

<!-- Indicatore di caricamento -->
{#if isLoading && hasMore}
  <div class="flex justify-center py-8" bind:this={scrollContainer}>
    <div class="flex items-center space-x-2">
      <div class="w-4 h-4 rounded-full bg-emerald-600 animate-bounce" style="animation-delay: 0s"></div>
      <div class="w-4 h-4 rounded-full bg-emerald-600 animate-bounce" style="animation-delay: 0.2s"></div>
      <div class="w-4 h-4 rounded-full bg-emerald-600 animate-bounce" style="animation-delay: 0.4s"></div>
      <span class="ml-3 text-emerald-600 font-medium">Caricamento...</span>
    </div>
  </div>
{/if}

<!-- Messaggio quando non ci sono più elementi -->
{#if !hasMore && !isLoading}
  <div class="text-center py-8 text-gray-500">
    <div class="flex flex-col items-center space-y-2">
      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="font-medium">Hai visto tutte le piante disponibili</p>
      <p class="text-sm">Non ci sono altri risultati da mostrare</p>
    </div>
  </div>
{/if}