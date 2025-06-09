<script lang="ts">
  import type { PiantePagination } from '$lib/stores/pianteStore';

  interface Props {
    pagination: PiantePagination;
    onPageChange: (page: number) => void;
  }

  let { pagination, onPageChange }: Props = $props();

  function goToPage(page: number) {
    onPageChange(page);
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Reactive computation for page numbers to display
  const pageNumbers = $derived.by(() => {
    const currentPage = pagination.currentPage;
    const totalPages = pagination.totalPages;
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Se ci sono 5 o meno pagine, mostra tutte le pagine
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    } else if (currentPage <= 3) {
      // Se siamo all'inizio, mostra le prime 5 pagine
      return Array.from({ length: maxVisible }, (_, i) => i + 1);
    } else if (currentPage >= totalPages - 2) {
      // Se siamo alla fine, mostra le ultime 5 pagine
      return Array.from({ length: maxVisible }, (_, i) => totalPages - maxVisible + 1 + i);
    } else {
      // Altrimenti, mostra 2 pagine prima e 2 dopo la pagina corrente
      return Array.from({ length: maxVisible }, (_, i) => currentPage - 2 + i);
    }
  });
</script>

{#if pagination.totalPages > 1}
  <div class="flex justify-center mt-12 mb-6">
    <nav class="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
      <!-- Pulsante Precedente -->
      {#if pagination.currentPage > 1}
        <button 
          onclick={() => goToPage(pagination.currentPage - 1)}
          class="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
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
      {#each pageNumbers as pageNum}
        {@const isCurrentPage = pageNum === pagination.currentPage}
        <button 
          onclick={() => goToPage(pageNum)}
          class="relative inline-flex items-center px-4 py-2 border text-sm transition-colors"
          class:z-10={isCurrentPage}
          class:bg-emerald-600={isCurrentPage}
          class:border-emerald-600={isCurrentPage}
          class:text-white={isCurrentPage}
          class:font-bold={isCurrentPage}
          class:bg-white={!isCurrentPage}
          class:border-gray-300={!isCurrentPage}
          class:text-gray-700={!isCurrentPage}
          class:font-medium={!isCurrentPage}
          class:hover:bg-gray-50={!isCurrentPage}
        >
          {pageNum}
        </button>
      {/each}
      
      <!-- Pulsante Successiva -->
      {#if pagination.currentPage < pagination.totalPages}
        <button 
          onclick={() => goToPage(pagination.currentPage + 1)}
          class="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
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