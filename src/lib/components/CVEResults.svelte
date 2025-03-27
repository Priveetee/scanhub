<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import CVEDetailModal from './CVEDetailModal.svelte';
  import CVEList from './CVEList.svelte';
  import CVESummary from './CVESummary.svelte';
  import type { CVEResult } from '$lib/services/cveService';
  
  // Props
  let { 
    results = [], 
    loading = false, 
    searchQuery = '', 
    registry = '' 
  } = $props<{
    results?: CVEResult[];
    loading?: boolean;
    searchQuery?: string;
    registry?: string;
  }>();
  
  // State
  let selectedCVE = $state<CVEResult | null>(null);
  
  // Functions
  function handleViewDetails(cve: CVEResult) {
    selectedCVE = cve;
  }
  
  function closeModal() {
    selectedCVE = null;
  }
</script>

<div class="w-full h-full flex flex-col">
  <!-- Header with search info -->
  <div 
    in:fly={{ y: -20, duration: 400, easing: cubicOut }}
    class="p-4 md:p-5 border-b border-slate-700/70 bg-slate-800/50 backdrop-blur-sm"
  >
    <div class="flex flex-col">
      <h2 class="text-xl font-semibold text-white">
        <span class="text-blue-400">CVE</span> Analysis Results
      </h2>
      {#if searchQuery}
        <div class="mt-2 flex items-center flex-wrap gap-2 text-sm">
          <div class="px-2 py-1 rounded bg-slate-700/50 border border-slate-600/50 font-mono text-slate-300">
            {searchQuery} 
          </div>
          <span class="text-slate-400">from</span>
          <div class="px-2 py-1 rounded bg-slate-700/50 border border-slate-600/50 text-slate-300">
            {registry || 'Docker Hub'}
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Results area - Important fix: ensure it's scrollable with proper overflow -->
  <div class="flex-1 overflow-y-auto custom-scrollbar">
    {#if loading}
      <div class="flex flex-col items-center justify-center h-full p-8">
        <div class="w-16 h-16 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-300">Analyzing vulnerabilities...</p>
      </div>
    {:else if results.length === 0}
      <div 
        in:fade={{ duration: 300 }}
        class="flex flex-col items-center justify-center h-full text-center p-8"
      >
        <div class="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        {#if searchQuery}
          <h3 class="text-xl font-medium text-white mb-2">No vulnerabilities found</h3>
          <p class="text-slate-400 max-w-md">
            No known CVEs were found for <span class="text-blue-400 font-mono">{searchQuery}</span>. 
            This doesn't guarantee the absence of vulnerabilities.
          </p>
        {:else}
          <h3 class="text-xl font-medium text-white mb-2">Search for a container image</h3>
          <p class="text-slate-400 max-w-md">
            Enter a container image name in the search bar to analyze it for known vulnerabilities.
          </p>
        {/if}
      </div>
    {:else}
      <div class="p-4 space-y-4">
        <!-- Show CVE summary component first -->
        <CVESummary results={results} imageQuery={searchQuery} />
        
        <!-- Then the main CVE list with filtering, pagination, etc. -->
        <CVEList results={results} onViewDetails={handleViewDetails} />
      </div>
    {/if}
  </div>
</div>

<!-- CVE Detail Modal - Full-screen fixed positioning to ensure proper centering -->
{#if selectedCVE}
  <CVEDetailModal cve={selectedCVE} onClose={closeModal} />
{/if}

<style>
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.5) rgba(30, 41, 59, 0.5);
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(59, 130, 246, 0.5);
    border-radius: 4px;
  }
</style>