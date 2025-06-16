<!-- src/routes/admin/+page.svelte - Svelte 5 con Runes 🪄 -->
<script lang="ts">
  import { onMount } from 'svelte';
import authStore from '$lib/stores/authStore.js';

  // ============================================
  // STATE CON $state 🪄
  // ============================================
  
  let stats = $state({
    totalArticles: 0,
    totalPlants: 0,
    totalAffiliateProducts: 0,
    totalUsers: 0,
    publishedArticles: 0,
    activeUsers: 0
  });

  let recentActivity = $state<Array<{
    id: string;
    type: 'create' | 'update' | 'delete';
    resource: string;
    description: string;
    timestamp: Date;
    user: string;
  }>>([]);

  let isLoading = $state(true);
  let error = $state('');
  let lastUpdate = $state<Date | null>(null);

  // ============================================
  // DERIVED VALUES CON $derived 🪄
  // ============================================

  let totalContent = $derived(stats.totalArticles + stats.totalPlants + stats.totalAffiliateProducts);
  let publishedPercentage = $derived(
    stats.totalArticles > 0 ? Math.round((stats.publishedArticles / stats.totalArticles) * 100) : 0
  );
  let activeUsersPercentage = $derived(
    stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0
  );

  // ============================================
  // FUNCTIONS
  // ============================================

  async function loadDashboardData() {
    try {
      isLoading = true;
      error = '';

      // Simula loading da API
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Qui caricherai i dati reali dalle API
      stats = {
        totalArticles: 24,
        totalPlants: 89,
        totalAffiliateProducts: 15,
        totalUsers: 5,
        publishedArticles: 18,
        activeUsers: 4
      };

      // Simula attività recente
      recentActivity = [
        {
          id: '1',
          type: 'create',
          resource: 'Articolo',
          description: 'Nuovo articolo "Come curare le piante grasse"',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min fa
          user: 'Admin'
        },
        {
          id: '2',
          type: 'update',
          resource: 'Pianta',
          description: 'Aggiornata scheda "Monstera deliciosa"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 ore fa
          user: 'Admin'
        },
        {
          id: '3',
          type: 'create',
          resource: 'Prodotto',
          description: 'Aggiunto prodotto affiliato "Fertilizzante Bio"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 ore fa
          user: 'Admin'
        }
      ];

      lastUpdate = new Date();
    } catch (err) {
      error = 'Errore nel caricamento dei dati';
      console.error('Dashboard load error:', err);
    } finally {
      isLoading = false;
    }
  }

  function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    return `${diffDays} giorni fa`;
  }

  function getActivityIcon(type: string): string {
    switch (type) {
      case 'create': return 'M12 6v6m0 0v6m0-6h6m-6 0H6';
      case 'update': return 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z';
      case 'delete': return 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  function getActivityColor(type: string): string {
    switch (type) {
      case 'create': return 'text-green-600 bg-green-100';
      case 'update': return 'text-blue-600 bg-blue-100';
      case 'delete': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  // ============================================
  // EFFECTS CON $effect 🪄
  // ============================================

  // Effect per caricare i dati al mount
  $effect(() => {
    loadDashboardData();
  });

  // Effect per auto-refresh ogni 5 minuti
  $effect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        loadDashboardData();
      }
    }, 5 * 60 * 1000); // 5 minuti

    return () => clearInterval(interval);
  });

  // ============================================
  // LIFECYCLE
  // ============================================

  onMount(() => {
    console.log('📊 Dashboard mounted');
  });
</script>

<!-- ============================================ -->
<!-- TEMPLATE -->
<!-- ============================================ -->

<svelte:head>
  <title>Dashboard Admin - Gestione Sistema</title>
</svelte:head>

<div class="p-6">
  <!-- Header -->
  <div class="mb-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Benvenuto, {authStore.user?.nome || authStore.user?.email}!
        </h1>
        <p class="text-gray-600">
          Panoramica del sistema e statistiche generali
        </p>
      </div>
      {#if lastUpdate && !isLoading}
        <div class="mt-4 sm:mt-0 text-sm text-gray-500">
          Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT')}
        </div>
      {/if}
    </div>
  </div>

  {#if error}
    <!-- Error State -->
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="text-red-800">{error}</span>
        </div>
        <button
          onclick={() => { error = ''; loadDashboardData(); }}
          class="text-red-600 hover:text-red-800 text-sm underline"
        >
          Riprova
        </button>
      </div>
    </div>
  {/if}

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {#if isLoading}
      <!-- Loading Skeleton -->
      {#each Array(4) as _}
        <div class="bg-white rounded-lg shadow p-6 animate-pulse">
          <div class="flex items-center justify-between">
            <div>
              <div class="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div class="h-8 bg-gray-300 rounded w-16"></div>
            </div>
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      {/each}
    {:else}
      <!-- Articoli Card -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Articoli</p>
            <p class="text-2xl font-bold text-gray-900">{stats.totalArticles}</p>
            <p class="text-xs text-green-600 mt-1">
              {stats.publishedArticles} pubblicati ({publishedPercentage}%)
            </p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Piante Card -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Piante</p>
            <p class="text-2xl font-bold text-gray-900">{stats.totalPlants}</p>
            <p class="text-xs text-gray-500 mt-1">Nel database</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Prodotti Affiliati Card -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Prodotti Affiliati</p>
            <p class="text-2xl font-bold text-gray-900">{stats.totalAffiliateProducts}</p>
            <p class="text-xs text-gray-500 mt-1">Attivi</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Utenti Card -->
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Utenti</p>
            <p class="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p class="text-xs text-green-600 mt-1">
              {stats.activeUsers} attivi ({activeUsersPercentage}%)
            </p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Grid Layout per contenuto aggiuntivo -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    
    <!-- Quick Stats -->
    <div class="lg:col-span-1">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Statistiche Rapide</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Contenuti totali</span>
            <span class="text-sm font-semibold text-gray-900">{totalContent}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Tasso pubblicazione</span>
            <span class="text-sm font-semibold text-green-600">{publishedPercentage}%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Utenti attivi</span>
            <span class="text-sm font-semibold text-blue-600">{activeUsersPercentage}%</span>
          </div>
          <div class="pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Stato sistema</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="lg:col-span-2">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Attività Recente</h3>
          <button
            onclick={loadDashboardData}
            class="text-sm text-green-600 hover:text-green-700 flex items-center"
            disabled={isLoading}
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Aggiorna
          </button>
        </div>

        {#if isLoading}
          <!-- Loading Activity -->
          <div class="space-y-4">
            {#each Array(3) as _}
              <div class="flex items-center space-x-4 animate-pulse">
                <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            {/each}
          </div>
        {:else if recentActivity.length === 0}
          <div class="text-center py-8 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>Nessuna attività recente</p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each recentActivity as activity}
              <div class="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="w-10 h-10 rounded-full flex items-center justify-center {getActivityColor(activity.type)}">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getActivityIcon(activity.type)} />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{activity.description}</p>
                  <div class="flex items-center mt-1 text-xs text-gray-500">
                    <span>{activity.user}</span>
                    <span class="mx-1">•</span>
                    <span>{formatRelativeTime(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="mt-8">
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href="/admin/articles/create"
          class="flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuovo Articolo
        </a>
        <a
          href="/admin/plants/create"
          class="flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuova Pianta
        </a>
        <a
          href="/admin/affiliate-products/create"
          class="flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuovo Prodotto
        </a>
        <button
          onclick={loadDashboardData}
          disabled={isLoading}
          class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? 'Aggiornamento...' : 'Aggiorna Dati'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  /* Animazioni per le cards */
  .hover\:shadow-lg:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  /* Animazione per il loading spinner */
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  /* Animazione pulse per skeleton */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Miglioramenti responsive */
  @media (max-width: 640px) {
    .grid-cols-1 {
      gap: 1rem;
    }
  }
</style>