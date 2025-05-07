<script lang="ts">
  import type { CVEResult } from '$lib/services/cveService';
  
  // Props
  let { 
    results = [], 
    imageQuery = ''
  } = $props<{
    results: CVEResult[];
    imageQuery: string;
  }>();

  // Calcul des comptages par sévérité
  function getSeverityCounts() {
    return {
      critical: results.filter((cve: CVEResult) => cve.severity === 'critical').length,
      high: results.filter((cve: CVEResult) => cve.severity === 'high').length,
      medium: results.filter((cve: CVEResult) => cve.severity === 'medium').length,
      low: results.filter((cve: CVEResult) => cve.severity === 'low').length
    };
  }
  
  // Calcul du score de risque
  function getRiskScore() {
    if (results.length === 0) return 0;
    
    const weights = {
      critical: 10,
      high: 5,
      medium: 2,
      low: 1,
    };
    
    const totalWeight = results.reduce((sum, cve) => 
      sum + (weights[cve.severity as keyof typeof weights] || 0), 0);
    const maxPossibleWeight = results.length * weights.critical;
    
    return Math.round((totalWeight / maxPossibleWeight) * 100);
  }
  
  // Obtenir la classe de couleur en fonction du score de risque
  function getRiskColor() {
    const score = getRiskScore();
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-orange-400';
    if (score >= 20) return 'text-yellow-400';
    return 'text-blue-400';
  }
  
  function getRiskBarColor() {
    const score = getRiskScore();
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-orange-500';
    if (score >= 20) return 'bg-yellow-500';
    return 'bg-blue-500';
  }
</script>

{#if results.length > 0}
<div class="bg-slate-800/70 rounded-lg border border-slate-700/30 mb-4">
  <div class="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <!-- Niveau de risque -->
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={getRiskColor()}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <span class="text-slate-300 text-sm">Risque:</span>
      <div class="relative h-1.5 w-24 bg-slate-700/70 rounded-full overflow-hidden">
        <div 
          class={`absolute top-0 left-0 h-full rounded-full ${getRiskBarColor()}`}
          style="width: {getRiskScore()}%"
        ></div>
      </div>
      <span class={`text-xs font-medium ${getRiskColor()}`}>
        {getRiskScore()}%
      </span>
    </div>
    
    <!-- Distribution simplifiée -->
    <div class="flex items-center gap-2 text-xs">
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-red-500"></div>
        <span class="text-white">{getSeverityCounts().critical}</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-orange-500"></div>
        <span class="text-white">{getSeverityCounts().high}</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
        <span class="text-white">{getSeverityCounts().medium}</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
        <span class="text-white">{getSeverityCounts().low}</span>
      </div>
    </div>
  </div>
</div>
{/if}