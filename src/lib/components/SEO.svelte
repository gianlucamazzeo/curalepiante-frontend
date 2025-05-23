<script lang="ts">
    export let title: string;
    export let description: string;
    export let keywords: string;
    export let ogImage: string;
    export let ogType: string = 'website';
    export let canonicalUrl: string;
    export let publishedTime: string = '';
    export let modifiedTime: string = '';
    export let authorName: string = 'GM';
    export let locale: string = 'it_IT';
    
    // Schema.org JSON-LD per rich snippets
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": title,
      "description": description,
      "url": canonicalUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${canonicalUrl.split('?')[0]}ricerca?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
  </script>
  
  <svelte:head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    
    <!-- Canonical URL per evitare contenuti duplicati -->
    <link rel="canonical" href={canonicalUrl} />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content={ogType} />
    <meta property="og:url" content={canonicalUrl} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:locale" content={locale} />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={canonicalUrl} />
    <meta property="twitter:title" content={title} />
    <meta property="twitter:description" content={description} />
    <meta property="twitter:image" content={ogImage} />
    <link rel="preload" href="/images/hero-background.png" as="image" />
    
    <!-- Articolo specifico meta tags (solo per pagine di articoli) -->
    {#if ogType === 'article' && publishedTime}
      <meta property="article:published_time" content={publishedTime} />
      {#if modifiedTime}
        <meta property="article:modified_time" content={modifiedTime} />
      {/if}
      {#if authorName}
        <meta property="article:author" content={authorName} />
      {/if}
    {/if}
    
    <!-- Schema.org JSON-LD per i rich snippets -->
    <script type="application/ld+json">
      {JSON.stringify(schemaData)}
    </script>
    
    <!-- Controllo robot (solo per la versione di produzione) -->
    {#if import.meta.env.PROD}
      <meta name="robots" content="index, follow" />
    {:else}
      <meta name="robots" content="noindex, nofollow" />
    {/if}
  </svelte:head>