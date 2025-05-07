<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { CVEResult } from '$lib/services/cveService';
  
  // Props
  let { 
    results = [], 
    onViewDetails,
    pageSize = 15 // Reduced from 25 for better mobile experience
  } = $props<{
    results: CVEResult[];
    onViewDetails: (cve: CVEResult) => void;
    pageSize?: number;
  }>();

  // State
  let currentPage = $state(1);
  let expandedItems = $state(new Set<string>());
  let selectedSeverity = $state<string | null>(null);
  let searchFilter = $state('');
  let sortField = $state<'published_date' | 'severity' | 'cvss_score'>('severity');
  let sortDirection = $state<'asc' | 'desc'>('desc');
  let containerRef: HTMLDivElement;

  // Severity colors and labels
  const severityMap: Record<string, { bg: string; border: string; text: string; label: string }> = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500',
      text: 'text-red-400',
      label: 'Critical'
    },
    high: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-400',
      text: 'text-orange-400',
      label: 'High'
    },
    medium: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-400',
      text: 'text-yellow-400',
      label: 'Medium'
    },
    low: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-400',
      text: 'text-blue-400',
      label: 'Low'
    },
    none: {
      bg: 'bg-gray-500/10',
      border: 'border-gray-400',
      text: 'text-gray-400',
      label: 'None'
    }
  };
  
  // Filtered results
  function getFilteredResults() {
    return results
      .filter((cve: CVEResult) => {
        // Filter by severity if selected
        if (selectedSeverity && cve.severity !== selectedSeverity) {
          return false;
        }
        
        // Filter by search text
        if (searchFilter) {
          const searchLower = searchFilter.toLowerCase();
          return (
            cve.id.toLowerCase().includes(searchLower) ||
            cve.title.toLowerCase().includes(searchLower) ||
            cve.description.toLowerCase().includes(searchLower) ||
            cve.affected_packages.some((pkg: string) => pkg.toLowerCase().includes(searchLower))
          );
        }
        
        return true;
      })
      .sort((a: CVEResult, b: CVEResult) => {
        // Handle sorting
        if (sortField === 'severity') {
          const severityRank: Record<string, number> = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1, 'none': 0 };
          const rankA = severityRank[a.severity] || 0;
          const rankB = severityRank[b.severity] || 0;
          return sortDirection === 'desc' ? rankB - rankA : rankA - rankB;
        } else if (sortField === 'cvss_score') {
          const scoreA = a.cvss_score ?? 0;
          const scoreB = b.cvss_score ?? 0;
          return sortDirection === 'desc' ? scoreB - scoreA : scoreA - scoreB;
        } else {
          // Default: sort by date
          const dateA = new Date(a.published_date).getTime();
          const dateB = new Date(b.published_date).getTime();
          return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
        }
      });
  }

  // Compute page count and paged results
  function getPageCount() {
    return Math.ceil(getFilteredResults().length / pageSize);
  }
  
  function getPagedResults() {
    return getFilteredResults().slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }

  // Get severity count
  function getSeverityCount(severity: string) {
    return results.filter((cve: CVEResult) => cve.severity === severity).length;
  }

  // Check if we have a high number of critical vulnerabilities
  function hasManyCritical() {
    return getSeverityCount('critical') >= 25;
  }
  
  // Functions
  function toggleExpand(id: string) {
    // Make a new set to ensure reactivity in Svelte 5
    const newSet = new Set(expandedItems);
    
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    
    expandedItems = newSet;
  }
  
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }
  
  function handlePageChange(page: number) {
    if (page >= 1 && page <= getPageCount()) {
      currentPage = page;
      // Scroll to top of list smoothly
      if (containerRef) {
        containerRef.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
  
  function toggleSort(field: 'published_date' | 'severity' | 'cvss_score') {
    if (sortField === field) {
      // Toggle direction if same field
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new field with default desc direction
      sortField = field;
      sortDirection = 'desc';
    }
    // Reset to first page when sorting changes
    currentPage = 1;
  }
  
  function resetFilters() {
    selectedSeverity = null;
    searchFilter = '';
    currentPage = 1;
  }

  $effect(() => {
    // Reset to first page when filters change
    if (searchFilter || selectedSeverity) {
      currentPage = 1;
    }
  });
</script>

<div class="space-y-4 w-full" bind:this={containerRef}>
<!-- Sticky header with summary and filters -->
<div class="bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 rounded-lg border border-slate-700/50 shadow-lg">
  <div class="p-4">
    <!-- Summary avec nombre de vulnérabilités -->
    <div class="flex flex-wrap justify-between items-center gap-3 mb-3">
      <div>
        <h3 class="text-white font-medium flex items-center">
          <span class={`text-lg font-semibold ${hasManyCritical() ? 'text-red-400 animate-pulse' : ''}`}>
            {getFilteredResults().length}
          </span> 
          <span class="ml-2">vulnérabilités trouvées</span>
          {#if results.length !== getFilteredResults().length}
            <span class="text-slate-400 text-sm ml-2">
              (sur {results.length} au total)
            </span>
          {/if}
        </h3>
      </div>
      
      <div class="flex items-center gap-2">
        {#if selectedSeverity || searchFilter}
          <button 
            onclick={() => resetFilters()}
            class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 px-3 py-1.5 border border-slate-700/70 rounded-lg hover:bg-slate-700/50"
            aria-label="Reset filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3h18v18H3z"></path>
              <path d="m15 9-6 6"></path>
              <path d="m9 9 6 6"></path>
            </svg>
            <span>Réinitialiser les filtres</span>
          </button>
        {/if}
        
        <!-- Page indicator for large datasets -->
        {#if getPageCount() > 1}
          <div class="px-3 py-1.5 text-sm rounded-lg border border-slate-700/70 bg-slate-800/90 text-slate-300">
            Page {currentPage} / {getPageCount()}
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Search and filters -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex-grow relative">
        <input
          type="text"
          bind:value={searchFilter}
          placeholder="Filtrer les vulnérabilités..."
          class="w-full bg-slate-800/70 border border-slate-700/70 rounded-lg p-2 pl-8 text-white placeholder-slate-400 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      </div>
      
      <div class="flex gap-2">
        <div class="inline-flex rounded-md shadow-sm" role="group">
          <button
            onclick={() => toggleSort('severity')}
            class={`px-3 py-2 text-sm font-medium rounded-l-lg border ${sortField === 'severity' ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' : 'bg-slate-800/70 text-slate-300 border-slate-700/70'}`}
            aria-label="Sort by severity"
          >
            Sévérité
            {#if sortField === 'severity'}
              <span class="ml-1">{sortDirection === 'desc' ? '▼' : '▲'}</span>
            {/if}
          </button>
          <button
            onclick={() => toggleSort('cvss_score')}
            class={`px-3 py-2 text-sm font-medium border-y ${sortField === 'cvss_score' ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' : 'bg-slate-800/70 text-slate-300 border-slate-700/70'}`}
            aria-label="Sort by CVSS score"
          >
            CVSS
            {#if sortField === 'cvss_score'}
              <span class="ml-1">{sortDirection === 'desc' ? '▼' : '▲'}</span>
            {/if}
          </button>
          <button
            onclick={() => toggleSort('published_date')}
            class={`px-3 py-2 text-sm font-medium rounded-r-lg border ${sortField === 'published_date' ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' : 'bg-slate-800/70 text-slate-300 border-slate-700/70'}`}
            aria-label="Sort by publication date"
          >
            Date
            {#if sortField === 'published_date'}
              <span class="ml-1">{sortDirection === 'desc' ? '▼' : '▲'}</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Severity filter tabs - conservé mais simplifié -->
    {#if results.length > 0}
      <div class="mt-3 border-t border-slate-700/40 pt-3 overflow-x-auto pb-1">
        <div class="flex flex-nowrap gap-2">
          {#each ['critical', 'high', 'medium', 'low', 'none'] as severity}
            {@const count = getSeverityCount(severity)}
            {@const isSelected = selectedSeverity === severity}
            {#if count > 0}
              <button 
                onclick={() => selectedSeverity = isSelected ? null : severity}
                class={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-all
                  ${isSelected ? 'bg-slate-700/90 ' + severityMap[severity].text : 'bg-slate-800/50 text-slate-300'}
                  ${isSelected ? 'ring-1 ring-' + severityMap[severity].border.substring(7) : 'border border-slate-600/50'}
                `}
                aria-label={`Filter by ${severityMap[severity].label} severity`}
                aria-pressed={isSelected}
              >
                <div class={`w-2 h-2 rounded-full ${severity === 'critical' ? 'bg-red-500' : severity === 'high' ? 'bg-orange-500' : severity === 'medium' ? 'bg-yellow-500' : severity === 'low' ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                <span>{severityMap[severity].label}</span>
                <span class="bg-slate-700/70 text-slate-300 text-xs px-1.5 py-0.5 rounded-full">{count}</span>
              </button>
            {/if}
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Results list -->
{#if getPagedResults().length === 0}
  <div class="bg-slate-800/70 rounded-lg p-8 text-center border border-slate-700/70">
    <div class="flex justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M8 15h8"></path>
        <path d="M9 9h.01"></path>
        <path d="M15 9h.01"></path>
      </svg>
    </div>
    
    <h3 class="text-white text-lg font-medium mb-2">Aucune vulnérabilité trouvée</h3>
    
    {#if searchFilter || selectedSeverity}
      <p class="text-slate-400 mb-4">Essayez d'ajuster vos filtres pour voir plus de résultats.</p>
      <button 
        onclick={() => resetFilters()}
        class="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30"
      >
        Effacer les filtres
      </button>
    {:else}
      <p class="text-slate-400">
        Aucune vulnérabilité ne correspond à vos critères.
      </p>
    {/if}
  </div>
{:else}
  <div class="space-y-4">
    {#each getPagedResults() as cve (cve.id)}
      <div
        transition:fade={{ duration: 200 }}
        class="rounded-lg bg-slate-800/70 border border-slate-700/70 overflow-hidden hover:border-slate-600/70 transition-all"
      >
        <!-- Header -->
        <div class="flex items-center border-b border-slate-700/50">
          <div class={`px-3 py-2 ${severityMap[cve.severity].bg} ${severityMap[cve.severity].border} border-l-4`}>
            <span class={`font-medium ${severityMap[cve.severity].text}`}>
              {severityMap[cve.severity].label}
            </span>
            {#if cve.cvss_score !== undefined}
              <span class="ml-2 px-1.5 py-0.5 rounded bg-slate-700/70 text-white text-xs">
                {cve.cvss_score.toFixed(1)}
              </span>
            {/if}
          </div>
          <div class="px-3 py-2 flex-grow">
            <div class="font-mono text-blue-400 text-sm">{cve.id}</div>
          </div>
          <div class="px-3 py-2 text-sm text-slate-400">
            {formatDate(cve.published_date)}
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-4">
          <h3 class="text-white font-medium text-lg mb-2">{cve.title}</h3>
          <p class="text-slate-300 text-sm mb-4 line-clamp-2">
            {cve.description}
          </p>
          
          <!-- Affected packages -->
          <div class="mb-4">
            <div class="text-sm text-slate-400 mb-1">Packages affectés :</div>
            <div class="flex flex-wrap gap-2">
              {#each cve.affected_packages.slice(0, 5) as pkg}
                <span class="px-2 py-1 bg-slate-700/50 text-white text-xs rounded border border-slate-600/50">
                  {pkg}
                </span>
              {/each}
              {#if cve.affected_packages.length > 5}
                <span class="px-2 py-1 bg-slate-700/50 text-white text-xs rounded border border-slate-600/50">
                  +{cve.affected_packages.length - 5} autres
                </span>
              {/if}
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <!-- Expand/collapse button -->
            <button 
              onclick={() => toggleExpand(cve.id)}
              class="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>{expandedItems.has(cve.id) ? 'Voir moins' : 'Voir plus'}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                class={`ml-1 transition-transform ${expandedItems.has(cve.id) ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            <!-- View details button -->
            <button
              onclick={() => onViewDetails(cve)}
              class="px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-blue-200 rounded border border-blue-500/30 text-sm transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Voir les détails
            </button>
          </div>
          
          <!-- Expanded content -->
          {#if expandedItems.has(cve.id)}
            <div 
              transition:slide={{ duration: 200 }}
              class="mt-4 pt-4 border-t border-slate-700/50"
            >
              <div class="text-sm text-slate-300 whitespace-pre-line">
                {cve.description}
              </div>
              
              {#if cve.references && cve.references.length > 0}
                <div class="mt-4">
                  <div class="text-sm text-slate-400 mb-1">Références :</div>
                  <ul class="list-disc list-inside text-sm text-blue-400 space-y-1">
                    {#each cve.references as ref}
                      <li>
                        <a href={ref} target="_blank" rel="noopener noreferrer" class="hover:underline">
                          {ref.length > 60 ? ref.substring(0, 60) + '...' : ref}
                        </a>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

<!-- Pagination -->
{#if getPageCount() > 1}
  <div class="flex justify-center mt-6 pb-6">
    <div class="inline-flex rounded-md shadow-sm">
      <!-- Previous button -->
      <button
        onclick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        class="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-l-lg border border-slate-700 {currentPage === 1 ? 'bg-slate-800/30 text-slate-500 cursor-not-allowed' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
      </button>
      
      <!-- Fast backward (first page) -->
      {#if currentPage > 2 && getPageCount() > 5}
        <button
          onclick={() => handlePageChange(1)}
          aria-label="First page"
          class="relative hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium border-y border-x border-slate-700 bg-slate-800/70 text-slate-300 hover:bg-slate-700/70"
        >
          1
        </button>
        
        {#if currentPage > 3}
          <span class="relative hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium border-y border-x border-slate-700 bg-slate-800/70 text-slate-400">
            …
          </span>
        {/if}
      {/if}
      
      <!-- Surrounding pages -->
      {#each Array(getPageCount()).fill(0).map((_, i) => i + 1).filter(page => 
        page === currentPage - 1 || 
        page === currentPage || 
        page === currentPage + 1 ||
        (page === 1 && currentPage <= 3) ||
        (page === 2 && currentPage <= 4) ||
        (page === getPageCount() && currentPage >= getPageCount() - 2) ||
        (page === getPageCount() - 1 && currentPage >= getPageCount() - 3)
      ).sort((a, b) => a - b) as page}
        <button
          onclick={() => handlePageChange(page)}
          aria-current={currentPage === page ? 'page' : undefined}
          aria-label={`Page ${page}`}
          class="relative inline-flex items-center px-3 py-2 text-sm font-medium border-y border-x border-slate-700 {currentPage === page ? 'bg-blue-600/30 text-blue-300' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'}"
        >
          {page}
        </button>
      {/each}
      
      <!-- Fast forward (last page) -->
      {#if currentPage < getPageCount() - 1 && getPageCount() > 5}
        {#if currentPage < getPageCount() - 2}
          <span class="relative hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium border-y border-x border-slate-700 bg-slate-800/70 text-slate-400">
            …
          </span>
        {/if}
        
        <button
          onclick={() => handlePageChange(getPageCount())}
          aria-label="Last page"
          class="relative hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium border-y border-x border-slate-700 bg-slate-800/70 text-slate-300 hover:bg-slate-700/70"
        >
          {getPageCount()}
        </button>
      {/if}
      
      <!-- Next button -->
      <button
        onclick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === getPageCount()}
        aria-label="Next page"
        class="relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-r-lg border border-slate-700 {currentPage === getPageCount() ? 'bg-slate-800/30 text-slate-500 cursor-not-allowed' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 18 6-6-6-6"></path>
        </svg>
      </button>
    </div>
  </div>
{/if}
</div>

<style>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse {
  animation: pulse 2s infinite;
}
</style>