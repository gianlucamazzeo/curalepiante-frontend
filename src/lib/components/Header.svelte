<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    
    // Menu items configuration
    const menuItems = [
      { 
        label: "Home", 
        url: "/" 
      },
      {
        label: "Piante",
        url: null, 
        submenu: [
          { label: "Piante da interno", url: "/piante/interno" },
          { label: "Piante da esterno", url: "/piante/esterno" },
          { label: "Piante grasse", url: "/piante/grasse" }
        ]
      },
      {
        label: "Consigli di giardinaggio",
        url: null, 
        submenu: [
          { label: "Irrigazione", url: "/suggerimenti/irrigazione" },
          { label: "Fertilizzazione", url: "/suggerimenti/fertilizzazione" },
          { label: "Potatura", url: "/suggerimenti/potatura" },
          { label: "Problemi comuni", url: "/suggerimenti/problemi" }
        ]
      }
    ];
    
    let scrolled = false;
    let menuOpen = false;
    let searchOpen = false;
    let searchQuery = '';
    let searchInput: HTMLInputElement;
    
    // Funzione per gestire l'invio della ricerca
    function handleSearch() {
      if (searchQuery.trim()) {
        window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        searchOpen = false;
        searchQuery = '';
      }
    }
    
    // Funzione per aprire il campo di ricerca
    function openSearch() {
      searchOpen = true;
      // Utilizziamo nextTick per assicurarci che l'elemento sia nel DOM
      setTimeout(() => {
        if (searchInput) {
          searchInput.focus();
        }
      }, 50);
    }
    
    // Gestione del click fuori dal campo di ricerca
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape' && searchOpen) {
        searchOpen = false;
      }
    }
    
    onMount(() => {
      const handleScroll = () => {
        scrolled = window.scrollY > 20;
      };
      
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('keydown', handleKeydown);
      
      // Aggiungiamo l'event listener per chiudere la ricerca quando si clicca fuori
      const handleDocumentClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (searchOpen && 
            !target.closest('.search-field') && 
            !target.closest('.search-button')) {
          searchOpen = false;
        }
      };
      
      document.addEventListener('click', handleDocumentClick);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('click', handleDocumentClick);
      };
    });
  </script>
  
  <header class={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-green-50 shadow-md py-2' : 'bg-gradient-to-r from-green-50 to-emerald-50 py-4'}`}>
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center">
        <!-- Logo con nome del sito -->
        <a href="/" class="flex items-center space-x-2 group cursor-pointer">
          <img src="/images/logo.svg" alt="Logo Cura delle Piante" class="h-10">
          <span class="font-semibold text-xl text-emerald-800 group-hover:text-emerald-600 transition-colors">curalepiante.it</span>
        </a>
        
        <!-- Menu principale (desktop) -->
        <nav class="hidden lg:flex items-center space-x-8">
          <a 
            href="/" 
            class={`py-2 font-medium transition-colors cursor-pointer ${$page.url.pathname === '/' ? 'text-emerald-600' : 'text-emerald-800 hover:text-emerald-600'}`}
          >
            Home
          </a>
          
          {#each menuItems.filter(item => item.label !== 'Home') as item}
            <div class="relative group flex items-center">
              {#if item.url !== null}
                <!-- Elemento cliccabile -->
                <a 
                  href={item.url} 
                  class={`py-2 font-medium transition-colors cursor-pointer ${$page.url.pathname.startsWith(item.url || '') ? 'text-emerald-600' : 'text-emerald-800 hover:text-emerald-600'}`}
                >
                  {item.label}
                </a>
              {:else}
                <!-- Elemento non cliccabile ma con dropdown -->
                <span class="py-2 font-medium text-emerald-800 cursor-default flex items-center">
                  {item.label}
                  <!-- Icona dropdown -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              {/if}
              
              {#if item.submenu}
                <div class="absolute left-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div class="bg-white shadow-lg rounded-lg py-2 border border-green-100">
                    {#each item.submenu as subitem}
                      <a 
                        href={subitem.url} 
                        class="block px-4 py-2 text-emerald-800 hover:text-emerald-600 hover:bg-green-50 cursor-pointer"
                      >
                        {subitem.label}
                      </a>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </nav>
        
        <!-- Search container con larghezza fissa -->
        <div class="flex items-center relative">
          <!-- Contenitore a larghezza fissa per mantenere la stabilità del layout -->
          <div class="relative search-field w-10 h-10 ml-auto">
            {#if searchOpen}
              <div 
                transition:slide={{ duration: 200 }}
                class="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-white rounded-full shadow-md overflow-hidden pr-1 w-72"
              >
                <!-- svelte-ignore a11y-autofocus -->
                <input
                  bind:this={searchInput}
                  type="text"
                  placeholder="Cerca nel sito..."
                  class="w-full py-2 px-4 border-none focus:outline-none focus:ring-0"
                  bind:value={searchQuery}
                  on:keydown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  class="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                  on:click={handleSearch}
                  aria-label="Invia ricerca"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            {:else}
              <!-- Pulsante per aprire la ricerca - posizionato nella stessa posizione del campo -->
              <button 
                class="search-button absolute right-0 text-emerald-800 hover:text-emerald-600 bg-white p-2 rounded-full shadow-sm transition-colors cursor-pointer"
                on:click|preventDefault|stopPropagation={openSearch}
                aria-label="Apri ricerca"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            {/if}
          </div>
          
          <!-- Menu hamburger (mobile) -->
          <button 
            class="lg:hidden text-emerald-800 hover:text-emerald-600 bg-white p-2 rounded-full shadow-sm cursor-pointer ml-6" 
            on:click|preventDefault|stopPropagation={() => menuOpen = !menuOpen} 
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Menu mobile -->
    {#if menuOpen}
      <div class="lg:hidden bg-green-50 shadow-inner mt-2">
        <div class="container mx-auto px-4 py-4 space-y-3">
          <a 
            href="/" 
            class={`block py-2 font-medium cursor-pointer ${$page.url.pathname === '/' ? 'text-emerald-600' : 'text-emerald-800'}`}
          >
            Home
          </a>
          
          {#each menuItems.filter(item => item.label !== 'Home') as item}
            <div>
              {#if item.url !== null}
                <a 
                  href={item.url} 
                  class={`block py-2 font-medium cursor-pointer ${$page.url.pathname.startsWith(item.url || '') ? 'text-emerald-600' : 'text-emerald-800'}`}
                >
                  {item.label}
                </a>
              {:else}
                <!-- Intestazione categoria per mobile (non cliccabile) -->
                <div class="py-2 font-medium text-emerald-800 flex justify-between items-center cursor-default">
                  {item.label}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              {/if}
              
              {#if item.submenu}
                <div class="pl-4 mt-1 space-y-1 border-l-2 border-green-200">
                  {#each item.submenu as subitem}
                    <a 
                      href={subitem.url} 
                      class="block py-1 text-emerald-700 hover:text-emerald-600 cursor-pointer"
                    >
                      {subitem.label}
                    </a>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
          
          <!-- Search input for mobile -->
          <div class="pt-2 border-t border-green-200 mt-2">
            <div class="relative">
              <input
                type="text"
                placeholder="Cerca nel sito..."
                class="w-full px-4 py-2 bg-white border border-green-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                bind:value={searchQuery}
                on:keydown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                class="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-600 bg-emerald-100 hover:bg-emerald-200 p-2 rounded-full transition-colors cursor-pointer"
                on:click={handleSearch}
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </header>