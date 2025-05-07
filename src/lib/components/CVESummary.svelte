<script lang="ts">
  import { onMount } from 'svelte';
  import type { CVEResult } from '$lib/services/cveService';
  
  // Props
  let { 
    results = [], 
    imageQuery = ''
  } = $props<{
    results: CVEResult[];
    imageQuery: string;
  }>();

  // Calculate severity counts
  function getSeverityCounts() {
    return {
      critical: results.filter((cve: CVEResult) => cve.severity === 'critical').length,
      high: results.filter((cve: CVEResult) => cve.severity === 'high').length,
      medium: results.filter((cve: CVEResult) => cve.severity === 'medium').length,
      low: results.filter((cve: CVEResult) => cve.severity === 'low').length,
      none: results.filter((cve: CVEResult) => cve.severity === 'none').length
    };
  }

  // Get total vulnerability count
  function getTotalVulnerabilities() {
    return results.length;
  }
  
  // Calculate criticality score  
  function getCriticalityScore() {
    return calculateCriticalityScore(results);
  }
  
  // Get unique affected packages
  function getAffectedPackages() {
    return getUniqueAffectedPackages(results);
  }
  
  // Get recent vulnerabilities
  function getRecentVulns() {
    return getRecentVulnerabilities(results);
  }
  
  // Helper functions
  function calculateCriticalityScore(cves: CVEResult[]): number {
    if (cves.length === 0) return 0;
    
    // Weighted score based on severity
    const weights = {
      critical: 10,
      high: 5,
      medium: 3,
      low: 1,
      none: 0
    };
    
    const totalWeight = cves.reduce((sum, cve) => sum + weights[cve.severity as keyof typeof weights], 0);
    const maxPossibleWeight = cves.length * weights.critical;
    
    return Math.round((totalWeight / maxPossibleWeight) * 100);
  }
  
  function getUniqueAffectedPackages(cves: CVEResult[]): string[] {
    const packages = new Set<string>();
    
    cves.forEach(cve => {
      cve.affected_packages.forEach(pkg => {
        packages.add(pkg);
      });
    });
    
    return Array.from(packages);
  }
  
  function getRecentVulnerabilities(cves: CVEResult[]): CVEResult[] {
    // Sort by date, newest first, and take top 3
    return [...cves]
      .sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime())
      .slice(0, 3);
  }
  
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }
</script>

{#if results.length > 0}
<div class="bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-700/50 mb-6">
  <!-- Header with image info -->
  <div class="bg-slate-900/50 border-b border-slate-700/50 p-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
      <div>
        <h2 class="text-xl font-semibold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Résumé des vulnérabilités
        </h2>
      </div>
      
      <div class="flex items-center">
        <div class="px-4 py-2 rounded bg-slate-700/50 flex items-center gap-2">
          <span class="text-slate-300 text-sm">Niveau de risque :</span>
          <div class="relative h-2 w-32 bg-slate-600/50 rounded-full overflow-hidden">
            <div 
              class="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
              class:bg-red-500={getCriticalityScore() >= 70}
              class:bg-orange-500={getCriticalityScore() >= 40 && getCriticalityScore() < 70}
              class:bg-yellow-500={getCriticalityScore() >= 20 && getCriticalityScore() < 40}
              class:bg-blue-500={getCriticalityScore() < 20}
              style="width: {getCriticalityScore()}%"
            ></div>
          </div>
          <span class={`text-sm font-medium 
            ${getCriticalityScore() >= 70 ? 'text-red-400' : 
              getCriticalityScore() >= 40 ? 'text-orange-400' : 
              getCriticalityScore() >= 20 ? 'text-yellow-400' : 
              'text-blue-400'}`}
          >
            {getCriticalityScore()}%
          </span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Stats grid - Fix for mobile responsiveness -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-700/50">
    <!-- Severity summary -->
    <div class="p-4">
      <h3 class="text-slate-400 text-sm font-medium mb-3">Sévérité</h3>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <span class="text-white">Critique</span>
          </div>
          <span class="text-white font-medium">{getSeverityCounts().critical}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-orange-500"></div>
            <span class="text-white">Élevée</span>
          </div>
          <span class="text-white font-medium">{getSeverityCounts().high}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span class="text-white">Moyenne</span>
          </div>
          <span class="text-white font-medium">{getSeverityCounts().medium}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-white">Faible</span>
          </div>
          <span class="text-white font-medium">{getSeverityCounts().low}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-gray-500"></div>
            <span class="text-white">Non définie</span>
          </div>
          <span class="text-white font-medium">{getSeverityCounts().none}</span>
        </div>
      </div>
    </div>
    
    <!-- Visualization -->
    <div class="p-4 h-auto">
      <h3 class="text-slate-400 text-sm font-medium mb-3">Distribution</h3>
      <div class="h-32 flex items-end gap-1">
        {#each ['critical', 'high', 'medium', 'low', 'none'] as severity}
          {@const counts = getSeverityCounts()}
          {@const count = counts[severity as keyof typeof counts]}
          {@const maxHeight = Math.max(...Object.values(counts))}
          {@const percentage = maxHeight > 0 ? (count / maxHeight) * 100 : 0}
          {@const color = 
            severity === 'critical' ? 'bg-red-500' :
            severity === 'high' ? 'bg-orange-500' :
            severity === 'medium' ? 'bg-yellow-500' :
            severity === 'low' ? 'bg-blue-500' : 'bg-gray-500'
          }
          
          <div class="flex-1 flex flex-col items-center">
            <div class="text-xs text-slate-400 mb-1">{count}</div>
            <div class={`w-full ${color} rounded-t-sm`} style="height: {percentage}%"></div>
            <div class="text-xs text-slate-400 mt-1 capitalize">
              {severity === 'critical' ? 'C' : 
               severity === 'high' ? 'H' : 
               severity === 'medium' ? 'M' : 
               severity === 'low' ? 'F' : 'N'}
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Affected packages -->
    <div class="p-4">
      <h3 class="text-slate-400 text-sm font-medium mb-3">Packages affectés</h3>
      <div class="space-y-2">
        {#if getAffectedPackages().length === 0}
          <div class="text-slate-300">Aucun package affecté</div>
        {:else}
          <div class="text-sm text-slate-300 mb-1">{getAffectedPackages().length} packages uniques</div>
          <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 custom-mini-scrollbar">
            {#each getAffectedPackages().slice(0, 10) as pkg}
              <span class="px-2 py-1 text-xs bg-slate-700/50 text-slate-200 rounded border border-slate-600/50">
                {pkg}
              </span>
            {/each}
            {#if getAffectedPackages().length > 10}
              <span class="px-2 py-1 text-xs bg-slate-700/50 text-slate-200 rounded border border-slate-600/50">
                +{getAffectedPackages().length - 10} autres
              </span>
            {/if}
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Recently discovered -->
    <div class="p-4">
      <h3 class="text-slate-400 text-sm font-medium mb-3">Publiées récemment</h3>
      {#if getRecentVulns().length === 0}
        <div class="text-slate-300">Aucune vulnérabilité récente</div>
      {:else}
        <ul class="space-y-2 max-h-32 overflow-y-auto pr-1 custom-mini-scrollbar">
          {#each getRecentVulns() as cve}
            <li class="border-l-2 border-blue-500 pl-2 py-1">
              <div class="font-mono text-blue-400 text-xs">{cve.id}</div>
              <div class="text-white text-sm truncate">{cve.title}</div>
              <div class="text-slate-400 text-xs">{formatDate(cve.published_date)}</div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</div>
{/if}

<style>
.custom-mini-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.3) rgba(30, 41, 59, 0.3);
}

.custom-mini-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-mini-scrollbar::-webkit-scrollbar-track {
  background: rgba(30, 41, 59, 0.3);
  border-radius: 2px;
}

.custom-mini-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}
</style>