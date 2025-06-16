<!-- src/routes/admin/+layout.svelte - VERSIONE CORRETTA -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { authActions, isAuthenticated, isLoading, user } from '$lib/stores/authStore.js';

  // ============================================
  // DESTRUCTURING STORES per Svelte 5 🪄
  // ============================================
  
  // Destructura gli stores per ottenere valori reattivi
  let isAuthenticatedValue = $derived($isAuthenticated);
  let isLoadingValue = $derived($isLoading);
  let userValue = $derived($user);

  // ============================================
  // PROPS (Svelte 5 Style)
  // ============================================
  
  let { children } = $props();

  // ============================================
  // STATE CON $state 🪄
  // ============================================
  
  let initializationComplete = $state(false);
  let sidebarOpen = $state(false);

  // ============================================
  // DERIVED VALUES CON $derived 🪄
  // ============================================

  let isLoginPage = $derived($page.url.pathname === '/admin/login');
  let shouldShowLoadingScreen = $derived(isLoadingValue || !initializationComplete);
  let currentPath = $derived($page.url.pathname);

  // Informazioni di navigazione
  let navigationItems = $derived([
    {
      label: 'Dashboard',
      href: '/admin',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z',
      active: currentPath === '/admin'
    },
    {
      label: 'Articoli',
      href: '/admin/articles',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      active: currentPath.startsWith('/admin/articles')
    },
    {
      label: 'Piante',
      href: '/admin/plants',
      icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
      active: currentPath.startsWith('/admin/plants')
    },
    {
      label: 'Prodotti Affiliati',
      href: '/admin/affiliate-products',
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      active: currentPath.startsWith('/admin/affiliate-products')
    }
  ]);

  // ============================================
  // EFFECTS CON $effect 🪄
  // ============================================

  // Effect per inizializzazione
  $effect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 [LAYOUT] Inizio inizializzazione layout...');
        
        // Timeout di sicurezza per l'inizializzazione
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout inizializzazione')), 15000)
        );
        
        await Promise.race([
          authActions.initialize(),
          timeoutPromise
        ]);
        
        console.log('✅ [LAYOUT] Inizializzazione completata');
        
        // Gestione redirect post-inizializzazione
        if (!isLoginPage && !isAuthenticatedValue) {
          console.log('🔄 [LAYOUT] Redirect a login (non autenticato)');
          await goto('/admin/login', { replaceState: true });
        } else if (isLoginPage && isAuthenticatedValue) {
          console.log('🔄 [LAYOUT] Redirect a dashboard (già autenticato)');
          await goto('/admin', { replaceState: true });
        }
      } catch (error) {
        console.error('❌ [LAYOUT] Errore inizializzazione:', error);
        if (!isLoginPage) {
          console.log('🔄 [LAYOUT] Redirect a login (errore)');
          await goto('/admin/login', { replaceState: true });
        }
      } finally {
        console.log('🏁 [LAYOUT] Inizializzazione completata, setting initializationComplete = true');
        initializationComplete = true;
      }
    };

    initialize();
  });

  // Effect per protezione automatica delle route
  $effect(() => {
    if (initializationComplete && !isLoginPage && !isAuthenticatedValue) {
      goto('/admin/login', { replaceState: true });
    }
  });

  // Effect per chiudere sidebar su mobile quando cambia route
  $effect(() => {
    // Dependency su currentPath per trigger
    currentPath;
    sidebarOpen = false;
  });

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }

  function closeSidebar() {
    sidebarOpen = false;
  }

  async function handleLogout() {
    try {
      await authActions.logout();
    } catch (error) {
      console.error('Errore durante logout:', error);
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  onMount(() => {
    console.log('🏗️ Admin layout mounted');
  });
</script>

<!-- ============================================ -->
<!-- TEMPLATE -->
<!-- ============================================ -->

<svelte:head>
  <title>Admin Dashboard</title>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if shouldShowLoadingScreen}
  <!-- Loading Screen -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
      <p class="text-gray-600">
        {#if isLoadingValue}
          Verifica autenticazione...
        {:else}
          Caricamento dashboard...
        {/if}
      </p>
    </div>
  </div>
{:else if isLoginPage}
  <!-- Login Page - Layout Semplice -->
  {@render children()}
{:else if isAuthenticatedValue}
  <!-- Dashboard Layout Completo -->
  <div class="min-h-screen bg-gray-50">
    
    <!-- Mobile Sidebar Overlay -->
    {#if sidebarOpen}
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onclick={closeSidebar}
      ></div>
    {/if}

    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-50
                   {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0">
      <div class="p-6">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-xl font-bold">Admin Panel</h2>
          <button
            onclick={closeSidebar}
            class="lg:hidden p-1 rounded-md text-gray-400 hover:text-white"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Navigation Menu -->
        <nav class="space-y-2">
          {#each navigationItems as item}
            <a
              href={item.href}
              class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                     {item.active 
                       ? 'bg-green-600 text-white' 
                       : 'text-gray-300 hover:bg-gray-800 hover:text-white'}"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </a>
          {/each}
        </nav>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="lg:ml-64">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <!-- Mobile Menu Button -->
              <button
                onclick={toggleSidebar}
                class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <h1 class="text-xl font-semibold text-gray-900">
                Dashboard Admin
              </h1>
            </div>

            <!-- User Menu -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-3">
                <div class="text-right hidden sm:block">
                  <p class="text-sm font-medium text-gray-900">
                    {userValue?.nome || userValue?.email || 'Admin'}
                  </p>
                  <p class="text-xs text-gray-500">{userValue?.ruolo}</p>
                </div>
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              
              <button
                onclick={handleLogout}
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Logout"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1">
        {@render children()}
      </main>
    </div>
  </div>
{:else}
  <!-- Fallback - Non dovrebbe mai essere mostrato -->
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <p class="text-gray-600 mb-4">Accesso richiesto</p>
      <a 
        href="/admin/login"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        Vai al Login
      </a>
    </div>
  </div>
{/if}

<style>
  /* Transizioni smooth */
  header {
    transition: all 0.2s ease-in-out;
  }
  
  nav a {
    transition: all 0.15s ease-in-out;
  }
  
  /* Focus states migliorati */
  button:focus,
  a:focus {
    outline: 2px solid #10b981;
    outline-offset: 2px;
  }

  /* Sidebar animations */
  aside {
    transition: transform 0.3s ease-in-out;
  }

  /* Responsive improvements */
  @media (max-width: 1024px) {
    aside {
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }
  }
</style>