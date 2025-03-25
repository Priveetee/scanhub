<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import type { CVEResult } from '$lib/services/cveService';
    
    export let cve: CVEResult;
    export let onClose: () => void;
    
    // Severity color mapping
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
    
    // Format date
    function formatDate(dateString: string): string {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        });
      } catch (e) {
        return dateString;
      }
    }
    
    // Handle click outside
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal-backdrop')) {
        onClose();
      }
    }
    
    // Handle escape key
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
  </script>
  
  <svelte:window on:keydown={handleKeydown} />
  
  <!-- Modal backdrop -->
  <div 
    class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop"
    on:click={handleOutsideClick}
    transition:fade={{ duration: 200 }}
  >
    <!-- Modal container -->
    <div 
      class="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      transition:scale={{ duration: 300, easing: cubicOut, start: 0.95 }}
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
        <div class="flex items-center space-x-3">
          <div class={`px-3 py-1 rounded ${severityMap[cve.severity].bg} ${severityMap[cve.severity].border} border-l-4`}>
            <span class={`font-medium ${severityMap[cve.severity].text}`}>
              {severityMap[cve.severity].label}
            </span>
            {#if cve.cvss_score !== undefined}
              <span class="ml-2 px-1.5 py-0.5 rounded bg-slate-700 text-white text-xs">
                {cve.cvss_score.toFixed(1)}
              </span>
            {/if}
          </div>
          <div class="font-mono text-blue-400">{cve.id}</div>
        </div>
        
        <button
          on:click={onClose}
          class="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6 overflow-y-auto custom-scrollbar">
        <h2 class="text-2xl font-semibold text-white mb-4">{cve.title}</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-slate-800/50 p-4 rounded-lg">
            <h3 class="text-sm text-slate-400 mb-1">Published</h3>
            <p class="text-white">{formatDate(cve.published_date)}</p>
          </div>
          
          <div class="bg-slate-800/50 p-4 rounded-lg">
            <h3 class="text-sm text-slate-400 mb-1">Severity</h3>
            <p class={severityMap[cve.severity].text}>{severityMap[cve.severity].label}</p>
          </div>
          
          <div class="bg-slate-800/50 p-4 rounded-lg">
            <h3 class="text-sm text-slate-400 mb-1">CVSS Score</h3>
            <p class="text-white">{cve.cvss_score !== undefined ? cve.cvss_score.toFixed(1) : 'N/A'}</p>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium text-white mb-2">Description</h3>
          <div class="bg-slate-800/50 p-4 rounded-lg">
            <p class="text-slate-300 whitespace-pre-line">{cve.description}</p>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium text-white mb-2">Affected Packages</h3>
          <div class="bg-slate-800/50 p-4 rounded-lg">
            <div class="flex flex-wrap gap-2">
              {#each cve.affected_packages as pkg}
                <span class="px-3 py-1.5 bg-slate-700 text-white rounded border border-slate-600/50">
                  {pkg}
                </span>
              {/each}
            </div>
          </div>
        </div>
        
        {#if cve.references && cve.references.length > 0}
          <div>
            <h3 class="text-lg font-medium text-white mb-2">References</h3>
            <div class="bg-slate-800/50 p-4 rounded-lg">
              <ul class="space-y-2 text-blue-400">
                {#each cve.references as ref}
                  <li>
                    <a 
                      href={ref} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="hover:underline inline-flex items-center"
                    >
                      {ref}
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1">
                        <path d="M7 7h10v10"></path>
                        <path d="M7 17 17 7"></path>
                      </svg>
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Footer -->
      <div class="border-t border-slate-700 p-4 bg-slate-800 flex justify-between items-center">
        <div class="text-slate-400 text-sm">
          CVE Analysis Tool
        </div>
        <button
          on:click={onClose}
          class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
  
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