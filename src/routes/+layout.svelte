<script lang="ts">
	import '../app.css';
	import SimpleSearchBar from '$lib/components/SimpleSearchBar.svelte';
	import CVEResults from '$lib/components/CVEResults.svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { searchCVEs, type CVEResult } from '$lib/services/cveService';
	import { saveRecentSearch } from '$lib/utils/searchUtils';
	
	let { children } = $props();
	
	// State - using $state() for reactivity in Svelte 5
	let isSearching = $state(false);
	let searchQuery = $state('');
	let searchRegistry = $state('Docker Hub'); // Simplified to just Docker Hub next i'm gonna add the functionnalities to change the registry
	let searchResults = $state<CVEResult[]>([]);
	let isLoading = $state(false);
	
	async function handleSearch(query: string) {
	  console.log('Searching for', query, 'in Docker Hub');
	  searchQuery = query;
	  isSearching = true;
	  isLoading = true;
	  
	  try {
	    // Call our service to get CVE data
	    searchResults = await searchCVEs(query, 'dockerhub');
	    // Save the search to recent searches
	    saveRecentSearch(query);
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
	  searchResults = [];
	}
</script>

<div class="relative min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
	<!-- Fond d'écran simplifié avec un dégradé statique -->
	
	{#if !isSearching}
	  <!-- Initial centered search view -->
	  <div 
	    class="absolute inset-0 flex items-center justify-center px-4 z-10"
	    transition:fade={{ duration: 300 }}
	  >
	    <div class="w-full max-w-2xl">
	      <h1 class="text-center text-3xl font-bold text-white mb-8">
	        CVE <span class="text-blue-400">Scanner</span>
	      </h1>
	      <SimpleSearchBar onSearch={handleSearch} />
	      <p class="text-center text-slate-300 mt-6 text-sm">
	        Search for container images to find potential vulnerabilities
	      </p>
	    </div>
	  </div>
	{:else}
	  <!-- Responsive layout for search results view -->
	  <div 
	    class="absolute inset-0 flex flex-col md:flex-row z-10"
	    in:fade={{ duration: 300 }}
	  >
	    <!-- Left panel with search (fixed height on mobile, full height on desktop) -->
	    <div class="flex flex-col bg-slate-900/80 backdrop-blur-sm md:w-2/5 lg:w-1/3 border-b md:border-b-0 md:border-r border-slate-700/50">
	      <!-- Back button and header -->
	      <div class="p-4 border-b border-slate-700/30">
	        <button 
	          onclick={() => resetSearch()}
	          class="flex items-center text-slate-300 hover:text-white transition-colors mb-4"
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
	          <span>Retour à la recherche</span>
	        </button>
	        
	        <!-- Title -->
	        <h2 class="text-xl font-semibold text-white">
	          <span class="text-blue-400">CVE</span> Scanner
	        </h2>
	      </div>
	      
	      <!-- Search form - always visible and accessible -->
	      <div class="p-4">
	        <SimpleSearchBar onSearch={handleSearch} />
	      </div>
	      
	      <!-- Search information - Added for better visibility -->
	      {#if searchQuery && !isLoading}
	        <div class="px-4 py-3 bg-slate-800/50 border-y border-slate-700/30">
	          <h3 class="text-sm text-slate-400 mb-1">Recherche en cours</h3>
	          <div class="flex flex-col gap-2">
	            <div class="flex items-center gap-1">
	              <span class="text-sm text-slate-400">Image:</span>
	              <span class="px-2 py-1 rounded text-sm bg-slate-700/50 border border-slate-600/50 font-mono text-slate-200">
	                {searchQuery}
	              </span>
	            </div>
	            <div class="flex items-center gap-1">
	              <span class="text-sm text-slate-400">Registry:</span>
	              <span class="px-2 py-1 rounded text-sm bg-slate-700/50 border border-slate-600/50 text-slate-200">
	                {searchRegistry}
	              </span>
	            </div>
	            {#if searchResults.length > 0}
	              <div class="flex items-center gap-1">
	                <span class="text-sm text-slate-400">Résultats:</span>
	                <span class="px-2 py-1 rounded text-sm bg-slate-700/50 border border-slate-600/50 text-slate-200">
	                  {searchResults.length} vulnérabilités
	                </span>
	              </div>
	            {/if}
	          </div>
	        </div>
	      {/if}
	      
	      <!-- Status information -->
	      {#if isLoading}
	        <div class="mt-4 p-4 text-center">
	          <div class="inline-block w-8 h-8 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
	          <p class="mt-3 text-slate-300 text-sm">Analyse des vulnérabilités en cours...</p>
	        </div>
	      {/if}
	    </div>
	    
	    <!-- Right panel with results (takes remaining space) -->
	    <div class="flex-1 md:h-screen overflow-hidden">
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