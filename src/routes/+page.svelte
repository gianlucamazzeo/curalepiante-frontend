<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { page } from '$app/stores';
    import SEO from '$lib/components/SEO.svelte';
    //import FeaturedPosts from '$lib/components/FeaturedPosts.svelte';
    //import CategoryGrid from '$lib/components/CategoryGrid.svelte';
    //import GuidesSection from '$lib/components/GuidesSection.svelte';
    //import NewsletterSignup from '$lib/components/NewsletterSignup.svelte';
    //import GallerySection from '$lib/components/GallerySection.svelte';
    //import RecentPosts from '$lib/components/RecentPosts.svelte';
    
    // Data che verrà prelevata da API
    let isLoading = false;
    let featuredPosts = [];
    let categories = [];
    let guides = [];
    let recentPosts = [];
    let galleryImages = [];
    
    const seoData = {
      title: 'Cura delle Piante - La tua guida per coltivare piante sane e rigogliose',
      description: 'Scopri consigli, guide e prodotti per la cura delle piante da interno ed esterno. Diventa esperto nella coltivazione di succulente, piante grasse, erbe aromatiche e molto altro.',
      keywords: 'cura delle piante, piante da interno, piante da esterno, succulente, erbe aromatiche, giardinaggio, consigli piante',
      ogImage: '/images/og-image-home.jpg',
      ogType: 'website',
      canonicalUrl: $page.url.href,
    };
    
    onMount(async () => {
      try {
        // Qui verrebbero effettuate le chiamate API
        /* 
          Esempio:
          const [featuredResponse, categoriesResponse, guidesResponse, postsResponse, galleryResponse] = await Promise.all([
            fetch('/api/featured-posts'),
            fetch('/api/categories'),
            fetch('/api/guides'),
            fetch('/api/posts?limit=3'),
            fetch('/api/gallery?limit=4')
          ]);
          
          featuredPosts = await featuredResponse.json();
          categories = await categoriesResponse.json();
          guides = await guidesResponse.json();
          recentPosts = await postsResponse.json();
          galleryImages = await galleryResponse.json();
        */
        
        // Per ora popoliamo con dati di esempio
        setTimeout(() => {
          isLoading = false;
        }, 300);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        isLoading = false;
      }
    });
  </script>
  
  <!-- SEO Component con tutti i meta tag necessari -->
  <SEO {...seoData} />
  
  <!-- Contenuto visibile solo dopo il caricamento per migliorare perceived performance -->
  {#if isLoading}
    <div class="flex justify-center items-center min-h-[60vh]">
      <div class="animate-pulse flex space-x-2">
        <div class="w-3 h-3 bg-green-600 rounded-full"></div>
        <div class="w-3 h-3 bg-green-600 rounded-full"></div>
        <div class="w-3 h-3 bg-green-600 rounded-full"></div>
      </div>
    </div>
  {:else}
    <main>
      <!-- Hero Section -->
      <section 
        class="relative h-[70vh] bg-cover bg-center" 
        style="background-image: url('/images/hero-background.jpg');"
        in:fade={{ duration: 500, delay: 100 }}
      >
        <div class="absolute inset-0 bg-black opacity-30"></div>
        <div class="relative container mx-auto px-4 h-full flex items-center">
          <div class="max-w-2xl text-white">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">Trasforma la tua casa in un'oasi verde</h1>
            <p class="text-xl mb-8">Scopri i nostri consigli e tutto ciò che ti serve per curare le tue piante al meglio</p>
            <div class="flex flex-col sm:flex-row gap-4">
              <a href="/catalogo" class="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                Esplora il catalogo
              </a>
              <a href="/guide" class="bg-transparent hover:bg-white/20 border-2 border-white text-white font-bold py-3 px-6 rounded-lg text-center transition duration-300">
                Scopri le nostre guide
              </a>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Componenti che usano i dati caricati da API -->
      <!-- Categorie Principali -->
      <!--<CategoryGrid categories={categories} /> -->
      
      <!-- Post in Evidenza -->
      <!--<FeaturedPosts posts={featuredPosts} /> -->
      
      <!-- Guide di Cura -->
      <!-- <GuidesSection guides={guides} /> -->
      
      <!-- Sezione Galleria/Testimonianze -->
      <!-- <GallerySection images={galleryImages} /> -->
      
      <!-- Post Recenti del Blog -->
      <!-- <RecentPosts posts={recentPosts} /> -->
      
      <!-- Iscrizione Newsletter -->
      <!-- <NewsletterSignup /> -->
      
      <!-- 
        In questa struttura, ogni sezione è implementata come componente riutilizzabile.
        Passando i dati come props, evitiamo rerenders inutili.
        L'uso di `in:fade` crea una transizione fluida quando i contenuti vengono caricati.
        
        SEO è gestito da un componente dedicato che include:
        - title e meta description
        - meta tags per condivisione social (Open Graph, Twitter)
        - canonical URL
        - schema.org markup per i rich snippets
        - meta robots per controllo crawling
        - alternative languages (se il sito è multilingua)
        
        La struttura favorisce il code splitting e il lazy loading dei componenti.
        
        Per ottimizzare ulteriormente le performance:
        - Utilizziamo il pattern container/presentational components
        - I componenti stateless vengono precompilati
        - Implementiamo memo per prevenire re-render inutili
        - Sfruttiamo tecniche di immagini responsive e lazy loading
      -->
    </main>
  {/if}