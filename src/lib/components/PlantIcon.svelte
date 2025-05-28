<script lang="ts">
  // Importa tutti i componenti SVG usando l'alias $lib
  import SunlightIcon from '$lib/icons/SunlightIcon.svelte';
  import WaterIconMinimum from '$lib/icons/WaterIconMinimum.svelte';
  import WaterIconMedium from '$lib/icons/WaterIconMedium.svelte';
  import WaterIconMaximum from '$lib/icons/WaterIconMaximum.svelte';
  import IndoorIcon from '$lib/icons/IndoorIcon.svelte';
  import FlowersIcon from '$lib/icons/FlowerIcon.svelte';
  import MedicinalIcon from '$lib/icons/MedicinalIcon.svelte';
  import EdibleIcon from '$lib/icons/EdibleIcon.svelte';
  import type { Component } from 'svelte';
 
  
  interface Props {
    type: string;
    size?: string;
    className?: string;
    title?: string;
  }
  
  let { type = '', size = '48', className = '', title = '' }: Props = $props();
  
  // Mappa dei componenti icona con tipizzazione corretta
  const iconComponents: Record<string, Component> = {
    sunlight: SunlightIcon,
    minimum: WaterIconMinimum,
    average: WaterIconMedium,
    frequent: WaterIconMaximum,
    indoor: IndoorIcon,
    flowers: FlowersIcon,
    medicinal: MedicinalIcon,
    edible: EdibleIcon
  };
  
  let IconComponent = $derived(iconComponents[type]);
  let iconTitle = $derived(title || type);
  let showTooltip = $state(false);

  function handleTouch() {
    showTooltip = !showTooltip;
    // Nascondi il tooltip dopo 2 secondi su mobile
    if (showTooltip) {
      setTimeout(() => {
        showTooltip = false;
      }, 2000);
    }
  }
</script>

<button
  type="button"
  class="inline-flex items-center justify-center relative group {className}"
  style="width: {size}px; height: {size}px;"
  aria-label={iconTitle}
  onclick={handleTouch}
  onkeydown={(e) => e.key === 'Enter' && handleTouch()}
>
  {#if IconComponent}
    <IconComponent {size} />
  {:else}
    <!-- Fallback per icone non trovate -->
    <div 
      class="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs font-medium border-2 border-gray-300"
    >
      ?
    </div>
  {/if}
  
  <!-- Tooltip -->
  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10" class:opacity-0={!showTooltip} class:opacity-100={showTooltip} class:group-hover:opacity-100={!showTooltip}>
    {iconTitle}
  </div>
</button>