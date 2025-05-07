<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { CVEResult } from '$lib/services/cveService';
  
  // Props
  let { cve, onClose } = $props<{
    cve: CVEResult;
    onClose: () => void;
  }>();
  
  // État local
  let activeTab = $state<'overview' | 'technical' | 'references'>('overview');
  
  // Severity color mapping
  const severityMap = {
    critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500',
      text: 'text-red-400',
      label: 'Critique'
    },
    high: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-400',
      text: 'text-orange-400',
      label: 'Élevé'
    },
    medium: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-400',
      text: 'text-yellow-400',
      label: 'Moyen'
    },
    low: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-400',
      text: 'text-blue-400',
      label: 'Faible'
    },
    none: {
      bg: 'bg-gray-500/10',
      border: 'border-gray-400',
      text: 'text-gray-400',
      label: 'Non défini'
    }
  };
  
  // CVSS score color
  function getCvssColor(score: number | undefined) {
    if (score === undefined) return 'text-gray-400';
    if (score >= 9) return 'text-red-400';
    if (score >= 7) return 'text-orange-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-blue-400';
  }
  
  // Format date
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }
  
  // Calculate time since publication
  function getTimeSince(dateString: string): string {
    try {
      const publishDate = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - publishDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) return `Il y a ${diffDays} jours`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `Il y a ${months} mois`;
      }
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0 
        ? `Il y a ${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois` 
        : `Il y a ${years} an${years > 1 ? 's' : ''}`;
    } catch (e) {
      return '';
    }
  }
</script>

<!-- Overlay with backdrop blur -->
<div 
  class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
  transition:fade={{ duration: 200 }}
>
  <!-- Modal container with scaling animation -->
  <div 
    class="bg-slate-900/90 w-full max-w-3xl max-h-[90vh] rounded-xl border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden"
    transition:scale={{ duration: 200, delay: 50, start: 0.95, opacity: 0, easing: cubicOut }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <!-- Header with sticky positioning -->
    <div class="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
      <div class="flex items-center space-x-3">
        <div class={`px-3 py-1 rounded-full ${severityMap[cve.severity].bg} ${severityMap[cve.severity].border} border`}>
          <span class={`font-medium ${severityMap[cve.severity].text}`}>
            {severityMap[cve.severity].label}
          </span>
          {#if cve.cvss_score !== undefined}
            <span class={`ml-2 font-bold ${getCvssColor(cve.cvss_score)}`}>
              {cve.cvss_score.toFixed(1)}
            </span>
          {/if}
        </div>
        <div class="font-mono text-blue-400">{cve.id}</div>
      </div>
      
      <button
        onclick={onClose}
        class="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <!-- Navigation tabs -->
    <div class="border-b border-slate-700/60 bg-slate-800/30">
      <div class="flex">
        <button 
          onclick={() => activeTab = 'overview'}
          class={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Vue d'ensemble
        </button>
        <button 
          onclick={() => activeTab = 'technical'}
          class={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'technical' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Détails techniques
        </button>
        {#if cve.references && cve.references.length > 0}
          <button 
            onclick={() => activeTab = 'references'}
            class={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'references' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Références
          </button>
        {/if}
      </div>
    </div>
    
    <!-- Content with proper scrolling -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      {#if activeTab === 'overview'}
        <div class="p-6">
          <h2 id="modal-title" class="text-2xl font-semibold text-white mb-4">{cve.title}</h2>
          
          <!-- Publication info -->
          <div class="mb-4 flex items-center gap-2">
            <span class="text-slate-400 text-sm">Publié le</span>
            <span class="text-white font-medium">{formatDate(cve.published_date)}</span>
            <span class="text-slate-500">•</span>
            <span class="text-slate-400 text-sm">{getTimeSince(cve.published_date)}</span>
          </div>
          
          <!-- Description -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-white mb-2">Description</h3>
            <div class="bg-slate-800/50 p-4 rounded-lg">
              <p class="text-slate-300 whitespace-pre-line">{cve.description}</p>
            </div>
          </div>
          
          <!-- Overview stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
              <div class="text-sm text-slate-400 mb-1.5">Score CVSS</div>
              {#if cve.cvss_score !== undefined}
                <div class="flex items-center">
                  <div class={`text-xl font-bold ${getCvssColor(cve.cvss_score)}`}>
                    {cve.cvss_score.toFixed(1)}
                  </div>
                  <div class="ml-2 text-xs text-slate-400">/ 10</div>
                </div>
              {:else}
                <p class="text-slate-500">Non défini</p>
              {/if}
            </div>
            
            <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
              <div class="text-sm text-slate-400 mb-1.5">Niveau de sévérité</div>
              <div class={`text-lg font-medium ${severityMap[cve.severity].text}`}>
                {severityMap[cve.severity].label}
              </div>
            </div>
            
            <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
              <div class="text-sm text-slate-400 mb-1.5">Packages affectés</div>
              <div class="text-lg font-medium text-white">
                {cve.affected_packages.length}
              </div>
            </div>
          </div>
        </div>
        
      {:else if activeTab === 'technical'}
        <div class="p-6">
          <!-- Affected packages section -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-white mb-2">Packages affectés</h3>
            <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
              <div class="flex flex-wrap gap-2">
                {#each cve.affected_packages as pkg}
                  <span class="px-3 py-1.5 bg-slate-700 text-white rounded border border-slate-600/50">
                    {pkg}
                  </span>
                {/each}
              </div>
            </div>
          </div>
          
          <!-- Technical details -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-white mb-2">Détails de vulnérabilité</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                <div class="text-sm text-slate-400 mb-1">Type</div>
                <div class="text-white">
                  {cve.title.includes('SQL') ? 'Injection SQL' : 
                   cve.title.includes('XSS') ? 'Cross-Site Scripting' :
                   cve.title.includes('Command') ? 'Injection de commande' :
                   cve.title.includes('Overflow') ? 'Buffer Overflow' :
                   cve.title.includes('Privilege') ? 'Élévation de privilèges' :
                   'Autre'}
                </div>
              </div>
              
              <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
                <div class="text-sm text-slate-400 mb-1">Impact</div>
                <div class="text-white">
                  {cve.cvss_score && cve.cvss_score >= 9 ? 'Critique' : 
                   cve.cvss_score && cve.cvss_score >= 7 ? 'Élevé' :
                   cve.cvss_score && cve.cvss_score >= 4 ? 'Modéré' :
                   'Faible'}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Full description -->
          <div class="mb-6">
            <h3 class="text-lg font-medium text-white mb-2">Description détaillée</h3>
            <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
              <p class="text-slate-300 whitespace-pre-line">{cve.description}</p>
            </div>
          </div>
        </div>
        
      {:else if activeTab === 'references'}
        <div class="p-6">
          <h3 class="text-lg font-medium text-white mb-2">Références externes</h3>
          <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700/30">
            <ul class="space-y-2 text-blue-400">
              {#each cve.references || [] as ref}
                <li class="break-words">
                  <a 
                    href={ref} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="hover:underline inline-flex items-start group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-1 mr-2 flex-shrink-0 opacity-70 group-hover:opacity-100">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    <span>{ref}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Footer with sticky positioning -->
    <div class="border-t border-slate-700 p-4 bg-slate-800/90 backdrop-blur-sm flex justify-between items-center sticky bottom-0 z-10">
      <div class="text-slate-400 text-xs">
        {cve.id} • {formatDate(cve.published_date)}
      </div>
      <button
        onclick={onClose}
        class="px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-blue-200 rounded border border-blue-500/30 transition-colors"
      >
        Fermer
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