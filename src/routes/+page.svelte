<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import SEO from '$lib/components/SEO.svelte';
	import Card from '../lib/components/Card.svelte';
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
		description:
			'Scopri consigli, guide e prodotti per la cura delle piante da interno ed esterno. Diventa esperto nella coltivazione di succulente, piante grasse, erbe aromatiche e molto altro.',
		keywords:
			'cura delle piante, piante da interno, piante da esterno, succulente, erbe aromatiche, giardinaggio, consigli piante',
		ogImage: '/images/hero-background.png',
		ogType: 'website',
		canonicalUrl: $page.url.href
	};

	categories = [
		{
			id: 1,
			nome: 'Piante da interno',
			slug: 'piante-interno',
			descrizione: 'Scopri le migliori piante per abbellire e purificare i tuoi spazi interni.',
			immagine: '/images/pianta-da-interno.png'
		},
		{
			id: 2,
			nome: 'Piante da esterno',
			slug: 'piante-esterno',
			descrizione:
				'Trasforma il tuo giardino con le piante più resistenti e decorative per esterni.',
			immagine: '/images/roserosse.png'
		},
		{
			id: 3,
			nome: 'Orto e commestibili',
			slug: 'orto-e-commestibili',
			descrizione: 'Facili da curare e bellissime da vedere: scopri il mondo delle succulente.',
			immagine: '/images/pommodori.png'
		}
	];

	guides = [
		{
			title: 'Come irrigare correttamente le piante',
			description:
				"Scopri i segreti per un'irrigazione efficace e risparmia acqua mantenendo le tue piante in salute.",
			image: '/articles/irrigare-correttamente-la-pianta.png',
			imageAlt: 'Come irrigare correttamente le piante',
			link: '/guide/irrigazione-corretta'
		},
		{
			title: 'Top 10 piante facili da curare',
			description:
				'Le migliori piante per principianti che richiedono poche attenzioni ma danno grandi soddisfazioni.',
			image: '/articles/potatura-pianta.png',
			imageAlt: 'Top 10 piante facili da curare',
			link: '/guide/piante-facili-cura'
		},
		{
			title: 'Tecniche di potatura efficaci',
			description: 'Impara quando e come potare le tue piante per stimolare la crescita.',
			image: '/articles/tecniche_potatura.png',
			imageAlt: 'Tecniche di potatura',
			link: '/guide/tecniche-potatura'
		},
		{
			title: 'Come combattere i parassiti',
			description: 'Soluzioni naturali ed efficaci contro i parassiti più comuni delle piante.',
			image: '/articles/combattere-parassiti-per-piante.png',
			imageAlt: 'Combattere i parassiti',
			link: '/guide/combattere-parassiti'
		},
		{
			title: 'Guida completa al rinvaso',
			description:
				'Tutti i passaggi per rinvasare correttamente le tue piante e farle crescere sane.',
			image: '/articles/rinvasare-le-piante.png',
			imageAlt: 'Guida al rinvaso',
			link: '/guide/rinvaso-piante'
		}
	];

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
	<div class="flex min-h-[60vh] items-center justify-center">
		<div class="flex animate-pulse space-x-2">
			<div class="h-3 w-3 rounded-full bg-green-600"></div>
			<div class="h-3 w-3 rounded-full bg-green-600"></div>
			<div class="h-3 w-3 rounded-full bg-green-600"></div>
		</div>
	</div>
{:else}
	<main class="bg-green-50">
		<!-- Hero Section -->
		<section
			class="relative h-[80vh] bg-cover bg-center"
			style="background-image: url('/images/hero-background.png');"
		>
			<div class="absolute inset-0 bg-black opacity-20"></div>
			<div class="relative container mx-auto flex h-full items-center px-4">
				<div class="max-w-2xl text-white">
					<h1 class="mb-4 font-serif text-4xl font-bold drop-shadow-lg md:text-5xl">
						Trasforma il tuo spazio in un giardino da sogno
					</h1>
					<p class="mb-8 text-xl drop-shadow-md">
						Scopri l'arte di creare e mantenere spazi verdi che incantano e rilassano
					</p>
					<div class="flex flex-col gap-4 sm:flex-row">
						<a
							href="/catalogo"
							class="rounded-lg bg-green-700 px-6 py-3 text-center font-bold text-white transition duration-300 hover:bg-green-800"
						>
							Esplora il catalogo
						</a>
						<a
							href="/guide"
							class="rounded-lg border border-white/50 bg-white/30 px-6 py-3 text-center font-bold text-white backdrop-blur-sm transition duration-300 hover:bg-white/40"
						>
							Guide e consigli
						</a>
					</div>
				</div>
			</div>
		</section>
		<!-- Categorie Principali -->
		<section
			class="mx-auto max-w-screen-xl bg-green-50 px-4 py-8 sm:px-6 lg:px-8"
			in:fade={{ duration: 300, delay: 100 }}
		>
			<div class="container mx-auto px-4">
				<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
					{#each categories as category}
						<div
							class="relative flex h-72 items-end overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:scale-105"
						>
							<div
								class="absolute inset-0 bg-black/50 bg-cover bg-center"
								style="background-image: url({category.immagine});"
							></div>
							<div class="absolute inset-0 bg-black/30"></div>
							<!-- overlay scura semi-trasparente -->
							<div class="relative z-10 p-6 text-white drop-shadow-md">
								<h3 class="mb-2 font-serif text-xl font-semibold">{category.nome}</h3>
								<p class="mb-4 text-sm">{category.descrizione}</p>
								<a
									href={`/piante/${category.slug}`}
									class="font-medium text-emerald-200 hover:text-emerald-100"
									>Esplora la categoria →</a
								>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<section
			class="mx-auto max-w-screen-xl bg-green-50 px-4 py-8 sm:px-6 lg:px-8"
			in:fade={{ duration: 300, delay: 100 }}
		>
			<div class="container mx-auto px-4">
				<h2 class="mb-10 text-center font-serif text-3xl font-bold text-emerald-800">
					Guide e consigli utili
				</h2>

				<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
					{#each guides.slice(0, 2) as article}
						<Card {...article} />
					{/each}
				</div>

				<div class="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
					{#each guides.slice(2) as article}
						<Card {...article} />
					{/each}
				</div>

				<div class="mt-8 text-center">
					<a
						href="/guide"
						class="inline-block rounded-lg border border-emerald-500 bg-white/30 px-6 py-3 font-bold text-emerald-700 backdrop-blur-sm transition-colors hover:bg-white/40"
					>
						Esplora tutte le guide
					</a>
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
