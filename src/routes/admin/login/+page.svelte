<!-- src/routes/admin/login/+page.svelte - Fix Completo -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authActions, isAuthenticated, isLoading, authError } from '$lib/stores/authStore.js';
  import type { LoginCredentials } from '$lib/utils/types.js';

  // ============================================
  // DESTRUCTURING STORES per Svelte 5 🪄
  // ============================================
  
  // Destructura gli stores per ottenere valori reattivi
  let isAuthenticatedValue = $derived($isAuthenticated);
  let isLoadingValue = $derived($isLoading);
  let authErrorValue = $derived($authError);

  // ============================================
  // STATE CON $state 🪄 (Runes nei .svelte)
  // ============================================
  
  let formData = $state<LoginCredentials>({
    email: '',
    password: ''
  });
  
  let showPassword = $state(false);
  let isSubmitting = $state(false);
  let localError = $state('');
  let validationErrors = $state<Record<string, string>>({});

  // ============================================
  // DERIVED VALUES CON $derived 🪄
  // ============================================

  let displayError = $derived(localError || authErrorValue);
  let isFormValid = $derived(
    formData.email && 
    formData.password && 
    Object.keys(validationErrors).length === 0
  );
  let buttonDisabled = $derived(
    isSubmitting || 
    isLoadingValue || 
    !isFormValid
  );

  // ============================================
  // EFFECTS CON $effect 🪄
  // ============================================

  // Effect per redirect se già autenticato
  $effect(() => {
    if (isAuthenticatedValue) {
      goto('/admin');
    }
  });

  // Effect per pulire errori al mount
  $effect(() => {
    authActions.clearError();
  });

  // ============================================
  // LIFECYCLE
  // ============================================

  onMount(() => {
    console.log('🔐 Login page mounted');
  });

  // ============================================
  // VALIDATION FUNCTIONS
  // ============================================

  function validateForm(): boolean {
    validationErrors = {};
    
    // Validazione email
    if (!formData.email) {
      validationErrors.email = 'Email obbligatoria';
    } else if (!isValidEmail(formData.email)) {
      validationErrors.email = 'Email non valida';
    }
    
    // Validazione password
    if (!formData.password) {
      validationErrors.password = 'Password obbligatoria';
    } else if (formData.password.length < 6) {
      validationErrors.password = 'Password troppo corta (min 6 caratteri)';
    }
    
    return Object.keys(validationErrors).length === 0;
  }

  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  async function handleSubmit() {
    localError = '';
    
    if (!validateForm()) {
      return;
    }

    isSubmitting = true;

    try {
      await authActions.login(formData);
      // Il redirect viene gestito automaticamente dall'authStore
    } catch (error) {
      localError = error instanceof Error ? error.message : 'Errore durante il login';
      console.error('Login error:', error);
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function clearError() {
    localError = '';
    authActions.clearError();
  }

  function clearFieldError(field: string) {
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      validationErrors = newErrors;
    }
  }

  // ============================================
  // DEVELOPMENT HELPERS
  // ============================================

  function fillDemoCredentials() {
    if (import.meta.env.DEV) {
      formData.email = 'admin@test.com';
      formData.password = 'password123';
    }
  }
</script>

<!-- ============================================ -->
<!-- TEMPLATE -->
<!-- ============================================ -->

<svelte:head>
  <title>Admin Login - Dashboard</title>
  <meta name="description" content="Accesso amministrativo alla dashboard" />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
  <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
    
    <!-- Header -->
    <div class="p-8 pb-6">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p class="text-gray-600">Accedi per gestire il sistema</p>
      </div>

      <!-- Error Display -->
      {#if displayError}
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 relative">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm">{displayError}</span>
            </div>
            <button 
              onclick={clearError}
              class="text-red-400 hover:text-red-600 ml-2"
              aria-label="Chiudi errore"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      {/if}

      <!-- Form -->
      <div class="space-y-6">
        
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              bind:value={formData.email}
              oninput={() => clearFieldError('email')}
              onkeydown={handleKeydown}
              class="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors
                     {validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}"
              placeholder="admin@example.com"
              autocomplete="email"
              disabled={isSubmitting || isLoadingValue}
            />
          </div>
          {#if validationErrors.email}
            <p class="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          {/if}
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={formData.password}
              oninput={() => clearFieldError('password')}
              onkeydown={handleKeydown}
              class="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors
                     {validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}"
              placeholder="••••••••"
              autocomplete="current-password"
              disabled={isSubmitting || isLoadingValue}
            />
            <button
              type="button"
              onclick={togglePasswordVisibility}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              disabled={isSubmitting || isLoadingValue}
            >
              {#if showPassword}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              {:else}
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
          {#if validationErrors.password}
            <p class="mt-1 text-sm text-red-600">{validationErrors.password}</p>
          {/if}
        </div>

        <!-- Submit Button -->
        <button
          type="button"
          onclick={handleSubmit}
          disabled={buttonDisabled}
          class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white font-medium
                 bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600
                 transition-all duration-200"
        >
          {#if isSubmitting || isLoadingValue}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Accesso in corso...
          {:else}
            Accedi alla Dashboard
          {/if}
        </button>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-8 py-6 bg-gray-50 rounded-b-2xl">
      <div class="text-center text-sm text-gray-500">
        Solo utenti amministratori autorizzati
      </div>
      
      {#if import.meta.env.DEV}
        <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-xs text-blue-600 font-medium mb-2">Development Mode - Credenziali Test:</p>
          <div class="space-y-1">
            <p class="text-xs text-blue-600">Email: admin@test.com</p>
            <p class="text-xs text-blue-600">Password: password123</p>
            <button
              onclick={fillDemoCredentials}
              class="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              Riempi automaticamente
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Animazioni personalizzate */
  .transition-colors {
    transition-property: background-color, border-color, color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
  }

  /* Focus styles personalizzati */
  input:focus {
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  /* Hover states */
  button:not(:disabled):hover {
    transform: translateY(-1px);
  }

  button:disabled {
    transform: none;
  }

  /* Animazione per errori */
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  .error-shake {
    animation: shake 0.5s ease-in-out;
  }
</style>