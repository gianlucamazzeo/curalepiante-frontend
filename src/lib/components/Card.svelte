<script>
  export let title = '';
  export let description = '';
  export let image = '';
  export let imageAlt = '';
  export let link = '';
  export let linkText = 'Leggi di più →';
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
    
    <!-- Link -->
    {#if link}
      <a href={link} class="text-emerald-700 font-medium hover:text-emerald-600">{linkText}</a>
    {/if}
  </div>
</div>