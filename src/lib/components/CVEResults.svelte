<script lang="ts">
  import { fade } from 'svelte/transition';
  import CVEDetailModal from './CVEDetailModal.svelte';
  import CVEList from './CVEList.svelte';
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
  let viewMode = $state<'simple' | 'detailed'>('simple');
  
  // Functions
  function handleViewDetails(cve: CVEResult) {
    selectedCVE = cve;
  }
  
  function closeModal() {
    selectedCVE = null;
  }
  
  function toggleViewMode() {
    viewMode = viewMode === 'simple' ? 'detailed' : 'simple';
  }
  
  // Simplified format: seulement les vulnérabilités les plus critiques ou une vue minimaliste
  function getSimplifiedResults() {
    // Par défaut, trier par sévérité (critique et élevé d'abord)
    return [...results].sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }
</script>

<div class="w-full h-full flex flex-col">
  <!-- Contenu principal avec défilement -->
  <div class="flex-1 overflow-y-auto custom-scrollbar">
    {#if loading}
      <div class="flex flex-col items-center justify-center h-full p-8">
        <div class="w-16 h-16 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-300">Analyse en cours...</p>
      </div>
    {:else if results.length === 0}
      <div 
        in:fade={{ duration: 300 }}
        class="flex flex-col items-center justify-center h-full text-center p-8"
      >
        <div class="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-white mb-2">Aucune vulnérabilité trouvée</h3>
        <p class="text-slate-400 max-w-md text-sm">
          {searchQuery ? `Aucune CVE connue pour "${searchQuery}"` : "Entrez le nom d'une image pour l'analyser"}
        </p>
      </div>
    {:else}
      <div class="p-4">
        <!-- En-tête avec bascule de vue et résumé -->
        <div class="mb-4 flex justify-between items-center">
          <div class="text-white">
            <span class="text-lg font-semibold">{results.length}</span> 
            <span class="text-slate-300 text-sm ml-1">vulnérabilités</span>
            <span class="text-sm text-slate-400 ml-2">({searchQuery})</span>
          </div>
          <button 
            on:click={toggleViewMode}
            class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded border border-slate-700/70"
          >
            {viewMode === 'simple' ? 'Détails' : 'Vue simple'}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>

        {#if viewMode === 'simple'}
          <!-- Vue simplifiée -->
          <div class="space-y-2">
            {#each getSimplifiedResults() as cve}
              <div class="p-3 bg-slate-800/70 border-l-4 rounded-lg flex justify-between items-center"
                class:border-red-500={cve.severity === 'critical'}
                class:border-orange-500={cve.severity === 'high'}
                class:border-yellow-500={cve.severity === 'medium'}
                class:border-blue-500={cve.severity === 'low'}
                class:border-gray-500={cve.severity === 'none'}
              >
                <div>
                  <div class="text-sm text-white font-medium">{cve.title || cve.id}</div>
                  <div class="text-xs text-slate-400 flex items-center gap-2">
                    <span class="font-mono">{cve.id}</span>
                    <span>•</span>
                    <span>CVSS: {cve.cvss_score}</span>
                  </div>
                </div>
                <button
                  on:click={() => handleViewDetails(cve)}
                  class="px-2 py-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  Détails
                </button>
              </div>
            {/each}
          </div>
        {:else}
          <!-- Vue détaillée -->
          <CVEList results={results} onViewDetails={handleViewDetails} />
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- CVE Detail Modal -->
{#if selectedCVE}
  <CVEDetailModal cve={selectedCVE} onClose={closeModal} />
{/if}

<style>
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.5) rgba(30, 41, 59, 0.5);
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(30, 41, 59, 0.5);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(59, 130, 246, 0.5);
    border-radius: 3px;
  }
</style>