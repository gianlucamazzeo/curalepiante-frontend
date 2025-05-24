<script lang="ts">
  // Importa tutti i componenti SVG usando l'alias $lib
  import SunlightIcon from '$lib/icons/SunlightIcon.svelte';
  import WaterIconMinimum from '$lib/icons/WaterIconMinimum.svelte';
  import WaterIconMedium from '$lib/icons/WaterIconMedium.svelte';
  import WaterIconMaximum from '$lib/icons/WaterIconMaximum.svelte';
  import IndoorIcon from '$lib/icons/IndoorIcon.svelte';
  import FlowersIcon from '$lib/icons/FlowerIcon.svelte';
  import MedicinalIcon from '$lib/icons/MedicinalIcon.svelte';
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
    waterMinimum: WaterIconMinimum,
    waterMedium: WaterIconMedium,
    waterMaximum: WaterIconMaximum,
    indoor: IndoorIcon,
    flowers: FlowersIcon,
    medicinal: MedicinalIcon
  };
  
  let IconComponent = $derived(iconComponents[type]);
  let iconTitle = $derived(title || type);
</script>

<div 
  class="inline-flex items-center justify-center {className}"
  style="width: {size}px; height: {size}px;"
  title={iconTitle}
  role="img"
  aria-label={iconTitle}
>
  {#if IconComponent}
    <IconComponent {size} />
  {:else}
    <!-- Fallback per icone non trovate -->
    <div 
      class="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs font-medium border-2 border-gray-300"
      title="Icona non trovata: {type}"
    >
      ?
    </div>
  {/if}
</div>