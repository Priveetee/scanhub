<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import CVEDetailModal from '../services/CVEDetailModal.svelte';
    import type { CVEResult } from '$lib/services/cveService';
    
    export let results: CVEResult[] = [];
    export let loading = false;
    export let searchQuery = '';
    export let registry = '';
    
    // Selected CVE for detailed view
    let selectedCVE: CVEResult | null = null;
    
    // Severities with their colors
    const severityMap = {
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
    
    // Format date to a more readable format
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
    
    // Toggle expanded state for a vulnerability
    const expandedItems = new Set();
    function toggleExpand(id: string) {
      if (expandedItems.has(id)) {
        expandedItems.delete(id);
      } else {
        expandedItems.add(id);
      }
    }
    
    // View full details in modal
    function viewDetails(cve: CVEResult) {
      selectedCVE = cve;
    }
    
    // Close the modal
    function closeModal() {
      selectedCVE = null;
    }
  </script>
  
  <div class="w-full h-full flex flex-col overflow-hidden">
    <!-- Header with search info -->
    <div 
      in:fly={{ y: -20, duration: 400, easing: cubicOut }}
      class="p-5 border-b border-slate-700/70 bg-slate-800/50 backdrop-blur-sm"
    >
      <div class="flex flex-col">
        <h2 class="text-xl font-semibold text-white">
          <span class="text-blue-400">CVE</span> Analysis Results
        </h2>
        {#if searchQuery}
          <div class="mt-2 flex items-center text-sm">
            <div class="px-2 py-1 rounded bg-slate-700/50 border border-slate-600/50 font-mono text-slate-300">
              {searchQuery} 
            </div>
            <span class="mx-2 text-slate-400">from</span>
            <div class="px-2 py-1 rounded bg-slate-700/50 border border-slate-600/50 text-slate-300">
              {registry || 'Docker Hub'}
            </div>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Results area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {#if loading}
        <div class="flex flex-col items-center justify-center h-full">
          <div class="w-16 h-16 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>
          <p class="mt-4 text-slate-300">Analyzing vulnerabilities...</p>
        </div>
      {:else if results.length === 0}
        <div 
          in:fade={{ duration: 300 }}
          class="flex flex-col items-center justify-center h-full text-center"
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
        <div class="mb-4 flex justify-between items-center">
          <div class="text-white">
            <span class="font-medium">{results.length}</span> 
            <span class="text-slate-400">vulnerabilities found</span>
          </div>
          <div class="flex space-x-2">
            <!-- Filters could go here in the future -->
          </div>
        </div>
        
        <div class="space-y-4">
          {#each results as cve, i}
            <div 
              in:fly={{ y: 20, duration: 300, delay: i * 50, easing: cubicOut }}
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
                  <div class="text-sm text-slate-400 mb-1">Affected packages:</div>
                  <div class="flex flex-wrap gap-2">
                    {#each cve.affected_packages as pkg}
                      <span class="px-2 py-1 bg-slate-700/50 text-white text-xs rounded border border-slate-600/50">
                        {pkg}
                      </span>
                    {/each}
                  </div>
                </div>
                
                <div class="flex items-center justify-between">
                  <!-- Expand/collapse button -->
                  <button 
                    on:click={() => toggleExpand(cve.id)}
                    class="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>{expandedItems.has(cve.id) ? 'Show less' : 'Show more'}</span>
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
                    on:click={() => viewDetails(cve)}
                    class="px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-blue-200 rounded border border-blue-500/30 text-sm transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View Details
                  </button>
                </div>
                
                <!-- Expanded content -->
                {#if expandedItems.has(cve.id)}
                  <div 
                    transition:fade={{ duration: 150 }}
                    class="mt-4 pt-4 border-t border-slate-700/50"
                  >
                    <div class="text-sm text-slate-300 whitespace-pre-line">
                      {cve.description}
                    </div>
                    
                    {#if cve.references && cve.references.length > 0}
                      <div class="mt-4">
                        <div class="text-sm text-slate-400 mb-1">References:</div>
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