<script lang="ts">
	import '../app.css';
	import Aurora from '$lib/components/Aurora.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import CVEResults from '$lib/components/CVEResults.svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { searchCVEs, type CVEResult } from '$lib/services/cveService';
	
	let { children } = $props();
	
	// State - using $state() for reactivity in Svelte 5
	let isSearching = $state(false);
	let searchQuery = $state('');
	let searchRegistry = $state('');
	let searchResults = $state<CVEResult[]>([]);
	let isLoading = $state(false);
	
	async function onSearch(query: string, registry: string) {
	  console.log('Searching for', query, 'in registry', registry);
	  searchQuery = query;
	  searchRegistry = registry;
	  isSearching = true;
	  isLoading = true;
	  
	  try {
	    // Call our service to get CVE data
	    searchResults = await searchCVEs(query, registry);
	  } catch (error) {
	    console.error('Error searching for CVEs:', error);
	    searchResults = [];
	  } finally {
	    isLoading = false;
	  }
	}
	
	function resetSearch() {
	  isSearching = false;
	  searchQuery = '';
	  searchRegistry = '';
	  searchResults = [];
	}
</script>

<div class="relative min-h-screen w-full overflow-hidden">
	<!-- Aurora background effect -->
	<Aurora
	  colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
	  speed={0.8}
	  amplitude={1.2}
	/>
	
	{#if !isSearching}
	  <!-- Initial centered search view -->
	  <div 
	    class="absolute inset-0 flex items-center justify-center px-4 z-10"
	    transition:fade={{ duration: 300 }}
	  >
	    <SearchBar onSearch={onSearch} />
	  </div>
	{:else}
	  <!-- Split screen view -->
	  <div 
	    class="absolute inset-0 grid grid-cols-1 md:grid-cols-2 z-10 transition-all duration-500"
	    in:fade={{ duration: 300 }}
	  >
	    <!-- Left panel with search -->
	    <div class="relative h-full flex flex-col p-6">
	      <!-- Back button -->
	      <div 
	        in:fly={{ x: -20, duration: 300, easing: cubicOut }}
	        class="mb-6"
	      >
	        <button 
	          onclick={() => resetSearch()}
	          class="flex items-center text-slate-300 hover:text-white transition-colors"
	        >
	          <svg 
	            xmlns="http://www.w3.org/2000/svg" 
	            width="20" 
	            height="20" 
	            viewBox="0 0 24 24" 
	            fill="none" 
	            stroke="currentColor" 
	            stroke-width="2" 
	            stroke-linecap="round" 
	            stroke-linejoin="round" 
	            class="mr-2"
	          >
	            <path d="m12 19-7-7 7-7"></path>
	            <path d="M19 12H5"></path>
	          </svg>
	          <span>Back to full search</span>
	        </button>
	      </div>
	      
	      <!-- Search form -->
	      <div class="flex-grow flex items-center justify-center">
	        <div class="w-full max-w-lg">
	          <SearchBar onSearch={onSearch} />
	        </div>
	      </div>
	      
	      <!-- Logo/branding could go here -->
	      <div class="mt-auto pt-6 pb-4 text-center">
	        <div class="text-slate-500 text-sm">
	          CVE Scanner v1.0
	        </div>
	      </div>
	    </div>
	    
	    <!-- Right panel with results -->
	    <div 
	      class="relative h-full flex flex-col md:border-l border-slate-700/50 bg-slate-900/30 backdrop-blur-sm"
	      in:fly={{ x: 20, duration: 300, easing: cubicOut }}
	    >
	      <CVEResults 
	        results={searchResults} 
	        loading={isLoading} 
	        searchQuery={searchQuery}
	        registry={searchRegistry}
	      />
	    </div>
	  </div>
	{/if}
  
	<!-- Page content, only visible in initial view -->
	{#if !isSearching}
	  <div class="relative z-10 w-full pt-72 px-4">
	    <div class="container mx-auto">
	      {@render children()}
	    </div>
	  </div>
	{/if}
</div>