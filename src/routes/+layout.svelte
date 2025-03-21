<script lang="ts">
	import '../app.css';
	import Aurora from '$lib/components/Aurora.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	
	let { children } = $props();
	
	function onSearch(query: string, registry: string) {
	  console.log('Searching for', query, 'in registry', registry);
	  // Implémentez ici votre logique de recherche
	}
  </script>
  
  <div class="relative min-h-screen w-full overflow-hidden">
	<!-- Aurora background effect -->
	<Aurora
	  colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
	  speed={0.8}
	  amplitude={1.2}
	/>
  
	<!-- Search bar parfaitement centrée -->
	<div class="absolute inset-0 flex items-center justify-center px-4 z-10">
	  <SearchBar {onSearch} />
	</div>
  
	<!-- Page content poussé vers le bas pour être sous la barre de recherche -->
	<div class="relative z-10 w-full pt-72 px-4">
	  <div class="container mx-auto">
		{@render children()}
	  </div>
	</div>
  </div>