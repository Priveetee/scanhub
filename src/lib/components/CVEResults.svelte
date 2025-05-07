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
  let viewMode = $state<'executive' | 'simple' | 'detailed'>('simple');
  let exportDropdownOpen = $state(false);
  
  // Functions
  function handleViewDetails(cve: CVEResult) {
    selectedCVE = cve;
  }
  
  function closeModal() {
    selectedCVE = null;
  }
  
  function toggleViewMode() {
    if (viewMode === 'simple') viewMode = 'detailed';
    else if (viewMode === 'detailed') viewMode = 'executive';
    else viewMode = 'simple';
  }
  
  function getViewModeLabel() {
    switch (viewMode) {
      case 'executive': return 'Vue simple';
      case 'simple': return 'Vue détaillée';
      case 'detailed': return 'Résumé exécutif';
    }
  }
  
  // Simplified format: seulement les vulnérabilités les plus critiques ou une vue minimaliste
  function getSimplifiedResults() {
    // Par défaut, trier par sévérité (critique et élevé d'abord)
    return [...results].sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }
  
  // Executive summary: seulement les vulnérabilités critiques et élevées
  function getExecutiveResults() {
    return [...results]
      .filter(cve => cve.severity === 'critical' || cve.severity === 'high')
      .sort((a, b) => {
        // D'abord par sévérité, puis par score CVSS
        if (a.severity !== b.severity) {
          const severityOrder = { critical: 4, high: 3 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        // À sévérité égale, trier par score CVSS (descendant)
        return (b.cvss_score || 0) - (a.cvss_score || 0);
      });
  }
  
  // Statistiques pour le résumé exécutif
  function getExecutiveStats() {
    const critical = results.filter(cve => cve.severity === 'critical').length;
    const high = results.filter(cve => cve.severity === 'high').length;
    const total = results.length;
    
    return {
      critical,
      high,
      criticalAndHigh: critical + high,
      other: total - critical - high,
      total
    };
  }
  
  // Export functions
  function exportToJson() {
    const jsonString = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Création d'un lien de téléchargement temporaire
    const link = document.createElement('a');
    link.href = url;
    link.download = `vulnerabilites-${searchQuery.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Nettoyage
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
    exportDropdownOpen = false;
  }
  
  function exportToCsv() {
    // En-têtes CSV
    const headers = ['ID', 'Sévérité', 'Titre', 'Score CVSS', 'Date de publication', 'Packages affectés'];
    
    // Données formatées pour CSV
    const csvRows = [
      headers.join(','),
      ...results.map(cve => [
        `"${cve.id}"`,
        `"${cve.severity}"`,
        `"${cve.title.replace(/"/g, '""')}"`,
        cve.cvss_score || '',
        `"${cve.published_date}"`,
        `"${cve.affected_packages.join(', ')}"`
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `vulnerabilites-${searchQuery.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
    exportDropdownOpen = false;
  }
  
  function toggleExportDropdown() {
    exportDropdownOpen = !exportDropdownOpen;
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
        <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
          <div class="text-white">
            <span class="text-lg font-semibold">{results.length}</span> 
            <span class="text-slate-300 text-sm ml-1">vulnérabilités</span>
            <span class="text-sm text-slate-400 ml-2">({searchQuery})</span>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Bouton d'export -->
            <div class="relative">
              <button 
                on:click={toggleExportDropdown}
                class="text-xs text-slate-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded border border-slate-700/70 bg-slate-800/80 hover:bg-slate-700/80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Exporter
              </button>
              
              {#if exportDropdownOpen}
                <div 
                  class="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 z-10"
                  transition:fade={{ duration: 150 }}
                >
                  <div class="py-1" role="menu" aria-orientation="vertical">
                    <button
                      on:click={exportToJson}
                      class="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                      role="menuitem"
                    >
                      Format JSON
                    </button>
                    <button
                      on:click={exportToCsv}
                      class="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                      role="menuitem"
                    >
                      Format CSV
                    </button>
                  </div>
                </div>
              {/if}
            </div>
            
            <!-- Bouton de changement de vue -->
            <button 
              on:click={toggleViewMode}
              class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded border border-slate-700/70"
            >
              {getViewModeLabel()}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>

        {#if viewMode === 'executive'}
          <!-- Résumé exécutif -->
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mb-4">
            <h3 class="text-white text-lg font-medium mb-3">Résumé exécutif</h3>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <div class="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                <div class="text-xs text-slate-400">Critiques</div>
                <div class="text-red-400 text-lg font-semibold">{getExecutiveStats().critical}</div>
              </div>
              
              <div class="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                <div class="text-xs text-slate-400">Élevées</div>
                <div class="text-orange-400 text-lg font-semibold">{getExecutiveStats().high}</div>
              </div>
              
              <div class="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                <div class="text-xs text-slate-400">Autres</div>
                <div class="text-blue-400 text-lg font-semibold">{getExecutiveStats().other}</div>
              </div>
              
              <div class="bg-slate-600/10 border border-slate-600/20 p-3 rounded-lg">
                <div class="text-xs text-slate-400">Total</div>
                <div class="text-white text-lg font-semibold">{getExecutiveStats().total}</div>
              </div>
            </div>
            
            <div class="text-sm text-slate-300 mb-2">
              Vulnérabilités requérant une attention immédiate :
            </div>
          </div>
          
          <!-- Liste des vulnérabilités critiques et élevées seulement -->
          <div class="space-y-2">
            {#each getExecutiveResults() as cve}
              <div class="p-3 bg-slate-800/70 border-l-4 rounded-lg flex justify-between items-center"
                class:border-red-500={cve.severity === 'critical'}
                class:border-orange-500={cve.severity === 'high'}
              >
                <div>
                  <div class="text-sm text-white font-medium">{cve.title || cve.id}</div>
                  <div class="text-xs text-slate-400 flex items-center gap-2">
                    <span class="font-mono">{cve.id}</span>
                    <span>•</span>
                    <span class="text-xs px-1.5 py-0.5 rounded bg-slate-700/70 text-white">CVSS {cve.cvss_score}</span>
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
          
        {:else if viewMode === 'simple'}
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