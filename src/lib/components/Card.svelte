<script lang="ts">
  import PlantIcon from './PlantIcon.svelte';

  interface Props {
    title: string;
    description: string;
    image?: string;
    imageAlt?: string;
    link?: string;
    linkText?: string;
    watering?: string;
    sunlight?: string[];
    indoor?: boolean;
    flowers?: boolean;
    medicinal?: boolean;
  }

  let { 
    title = '',
    description = '',
    image = '',
    imageAlt = '',
    link = '',
    linkText = 'Leggi di più →',
    watering = '',
    sunlight = [],
    indoor = false,
    flowers = false,
    medicinal = false
  }: Props = $props();

  function getWateringIcon(wateringLevel: string): string {
    switch (wateringLevel?.toLowerCase()) {
      case 'frequent':
        return 'waterMaximum';
      case 'average':
        return 'waterMedium';
      case 'minimum':
        return 'waterMinimum';
      default:
        return 'waterMinimum';
    }
  }
</script>

<div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
  {#if image}
    <!-- Immagine card -->
    <img src={image} alt={imageAlt} class="w-full md:w-2/5 h-48 md:h-full object-cover">
  {/if}
  
  <div class="p-6 flex flex-col flex-grow">
    <!-- Titolo -->
    <h3 class="text-emerald-800 font-serif text-xl font-semibold mb-2">{title}</h3>
    
    <!-- Descrizione -->
    <p class="text-gray-600 mb-4 flex-grow">{description}</p>
    
    <!-- Icone delle caratteristiche della pianta -->
    <div class="flex items-center gap-2 mb-4">
      {#if watering}
        <PlantIcon type={getWateringIcon(watering)} size="40" className="text-blue-500" />
      {/if}
      
      {#if sunlight && sunlight.length > 0}
        <PlantIcon type="sunlight" size="40" className="text-yellow-500" />
      {/if}
      
      {#if indoor}
        <PlantIcon type="indoor" size="40" className="text-green-500" />
      {/if}
      
      {#if flowers}
        <PlantIcon type="flowers" size="40" className="text-pink-500" />
      {/if}
      
      {#if medicinal}
        <PlantIcon type="medicinal" size="40" className="text-purple-500" />
      {/if}
    </div>
    
    <!-- Link -->
    {#if link}
      <a href={link} class="text-emerald-700 font-medium hover:text-emerald-600">{linkText}</a>
    {/if}
  </div>
</div>