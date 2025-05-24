<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { onMount } from 'svelte';
	import { categorieStore } from '$lib/stores/categorieStore';

	let { children } = $props();
	
	onMount(() => {
		// Questo metodo controllerà la cache e farà una chiamata API solo se necessario
		categorieStore.fetchCategorie();
		
		// Aggiungi un event listener per il focus della finestra
		// Questo ricaricherà le categorie se la cache è scaduta quando l'utente torna alla pagina
		window.addEventListener('focus', () => {
			categorieStore.fetchCategorie();
		});
		
		// Cleanup dell'event listener quando il componente viene smontato
		return () => {
			window.removeEventListener('focus', () => {
				categorieStore.fetchCategorie();
			});
		};
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com">
	<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+Pro:wght@300;400;600&display=swap" rel="stylesheet">
</svelte:head>

<div class="site-wrapper min-h-screen flex flex-col">
	<Header />
	<main class="flex-grow pt-12 md:pt-14">
		
		{@render children()}
	
	</main>
	<Footer />
</div>