<script lang="ts">
    import { fade, slide, scale, fly } from 'svelte/transition';
    import { elasticOut, cubicOut } from 'svelte/easing';
    import { tweened } from 'svelte/motion';
    import { onMount } from 'svelte';
    
    export let onSearch: (query: string, registry: string) => void;
  
    const REGISTRIES = [
      { 
        id: 'dockerhub', 
        label: 'Docker Hub', 
        examples: ['nginx:latest', 'ubuntu:22.04', 'postgres:15', 'node:22', 'mongo:latest'],
        prefix: '',
        description: 'Official Docker public registry'
      }
    ];
  
    let imagePath = '';
    let selectedRegistry = REGISTRIES[0];
    let isFocused = false;
    let showRegistries = false;
    let isSubmitting = false;
    let inputElement: HTMLInputElement;
    let mounted = false;
    
    const glowOpacity = tweened(0, { duration: 300, easing: cubicOut });
    
    $: if (isFocused) {
      glowOpacity.set(1);
    } else {
      glowOpacity.set(0);
    }
    
    onMount(() => {
      mounted = true;
    });
    
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (showRegistries && !target?.closest('.registry-selector')) {
        showRegistries = false;
      }
    }
    
    function handleRegistrySelect(registry: typeof REGISTRIES[number]) {
      selectedRegistry = registry;
      showRegistries = false;
      inputElement?.focus();
    }
    
    function handleSubmit() {
      if (!imagePath.trim()) return;
      
      isSubmitting = true;
      const fullPath = selectedRegistry.prefix + imagePath;
      
      setTimeout(() => {
        onSearch(fullPath, selectedRegistry.id);
        isSubmitting = false;
        imagePath = '';
      }, 600);
    }
    
    function handleClearInput() {
      imagePath = '';
      inputElement?.focus();
    }
    
    function toggleRegistry() {
      showRegistries = !showRegistries;
    }
    
    function handleExampleClick(example: string) {
     // console.log('handleExampleClick appelé avec:', example);
      imagePath = example;
      
      // Forcer une mise à jour du DOM avec un délai
      setTimeout(() => {
       // console.log('Focus appliqué, imagePath =', imagePath);
        inputElement?.focus();
      }, 10);
    }
  </script>
  
  <svelte:window on:click={handleClickOutside} />
  
  <div class="w-full h-full flex flex-col justify-center items-center px-6">
    {#if mounted}
      <!-- Barre de recherche -->
      <div 
        in:fly={{ y: 30, duration: 700, delay: 200, easing: cubicOut }}
        class="w-full max-w-xl"
      >
        <form on:submit|preventDefault={handleSubmit} class="relative w-full">
          <div 
            class="absolute -inset-6 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 rounded-full blur-3xl" 
            style="opacity: {$glowOpacity * 0.1};"
          ></div>
          
          <div class="relative" 
            in:fly={{ y: 20, duration: 600, delay: 300, easing: cubicOut }}
          >
            <div 
              class="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-xl rounded-2xl"
              style="opacity: {$glowOpacity};"
            ></div>
  
            <div class="relative flex items-center bg-gradient-to-r from-slate-800/90 to-slate-800/80 backdrop-blur-lg rounded-2xl border-2 transition-all duration-300 shadow-lg overflow-hidden {isFocused ? 'border-blue-500/50 shadow-blue-500/20' : 'border-slate-700/50'}">
              <button
                type="submit"
                disabled={isSubmitting}
                class="p-4 rounded-l-xl transition-all relative overflow-hidden flex items-center justify-center z-10 group hover:scale-105 active:scale-95"
              >
                <div class="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-blue-400/5 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                
                {#if isSubmitting}
                  <div class="animate-spin text-blue-400">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="26" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      stroke-width="2" 
                      stroke-linecap="round" 
                      stroke-linejoin="round"
                    >
                      <path d="M12 6V3"></path>
                      <path d="m6.6 7-2-3.5"></path>
                      <path d="M6 12H3"></path>
                      <path d="m7 17.5-3 1.7"></path>
                      <path d="M12 21v-3"></path>
                      <path d="m17 17.5 3 1.7"></path>
                      <path d="M21 12h-3"></path>
                      <path d="m17.5 7-2-3.5"></path>
                    </svg>
                  </div>
                {:else}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    class="text-slate-400 group-hover:text-blue-400 transition-colors"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                {/if}
              </button>
  
              <div class="flex-grow relative">
                <input
                  bind:this={inputElement}
                  type="text"
                  bind:value={imagePath}
                  on:focus={() => isFocused = true}
                  on:blur={() => isFocused = false}
                  placeholder={`Search for an image (e.g. ${selectedRegistry.examples[0]})`}
                  class="search-input w-full bg-transparent text-lg text-white placeholder-slate-400 outline-none py-4 px-3"
                />
                
                {#if imagePath}
                  <button
                    type="button"
                    on:click={handleClearInput}
                    in:scale={{ duration: 200, easing: elasticOut, start: 0.5 }}
                    class="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all hover:scale-110 active:scale-90"
                    aria-label="Clear search"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      stroke-width="2" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      class="text-slate-400 hover:text-slate-300"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                {/if}
              </div>
              
              <div class="registry-selector relative h-full border-l border-slate-700/50">
                <button
                  type="button"
                  on:click={() => toggleRegistry()}
                  class="h-full px-4 flex items-center gap-2 transition-all hover:bg-slate-700/50"
                  aria-label="Change registry"
                >
                  <div class="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                      <path d="M12 3h8v8h-8zM8 13V5h8v8H8z" />
                      <path d="M4 21V9h8v12H4z" />
                      <path d="M22 18h0" />
                    </svg>
                    <span class="font-medium text-white text-sm">{selectedRegistry.label}</span>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    class="text-slate-400 transition-transform duration-300 {showRegistries ? 'rotate-180' : ''}"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {#if showRegistries}
            <div 
              transition:slide={{ duration: 200, easing: cubicOut }}
              class="absolute right-0 mt-2 w-72 bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-lg rounded-xl border border-slate-600/60 overflow-hidden z-50 shadow-lg"
            >
              <div class="p-3 border-b border-slate-700/70">
                <h3 class="text-white font-medium flex items-center gap-2">
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
                    class="text-blue-400"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                  Select a registry
                </h3>
              </div>
              
              <div class="p-3 space-y-2">
                {#each REGISTRIES as registry, i}
                  <div 
                    in:fly={{ y: 10, duration: 200, delay: i * 100, easing: cubicOut }}
                  >
                    <button
                      type="button"
                      on:click={() => handleRegistrySelect(registry)}
                      class="w-full flex items-start gap-3 p-4 hover:bg-slate-700/50 transition-all rounded-lg relative overflow-hidden hover:scale-[1.02] active:scale-[0.98] {registry.id === selectedRegistry.id ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/20 border border-blue-500/30 shadow-md' : 'border border-slate-700/30'}"
                      aria-label="Select registry: {registry.label}"
                    >
                      {#if registry.id === selectedRegistry.id}
                        <div class="shimmer absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0"></div>
                      {/if}
                      
                      <div class="mt-0.5 relative">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                          <path d="M12 3h8v8h-8zM8 13V5h8v8H8z" />
                          <path d="M4 21V9h8v12H4z" />
                          <path d="M22 18h0" />
                        </svg>
                      </div>
                      
                      <div class="flex flex-col items-start relative">
                        <span class="font-medium text-lg">{registry.label}</span>
                        <span class="text-sm text-slate-300">{registry.description}</span>
                        <span class="text-xs mt-2 font-mono bg-slate-800/80 px-2 py-1 rounded text-slate-300 border border-slate-700/50">
                          {registry.prefix || 'public registry'}
                        </span>
                      </div>
                      
                      {#if registry.id === selectedRegistry.id}
                        <div class="ml-auto flex items-center justify-center relative">
                          <div class="w-3 h-3 bg-blue-500 rounded-full pulse-animation"></div>
                        </div>
                      {/if}
                    </button>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </form>
      </div>

      <!-- Section d'exemples séparée et plus bas -->
      <div 
        in:fly={{ y: 20, duration: 600, delay: 400, easing: cubicOut }}
        class="w-full max-w-xl mt-10 bg-slate-900/50 p-5 rounded-xl border border-slate-700/30"
      >
        <div class="flex items-center gap-2 mb-3 text-white">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            class="text-blue-400"
          >
            <path d="M12 5v14"></path>
            <path d="M18 13l-6 6"></path>
            <path d="M6 13l6 6"></path>
          </svg>
          <span class="font-medium">Exemples populaires</span>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-sm px-2">
          {#each selectedRegistry.examples as example}
            <div 
              in:scale={{ duration: 300, delay: 500, easing: elasticOut }}
            >
              <button 
                type="button"
                on:click={() => handleExampleClick(example)}
                class="text-blue-400 hover:text-blue-300 transition-all border-2 border-blue-500/20 hover:border-blue-500/50 px-4 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/70 hover:scale-105 active:scale-95 shadow-lg"
              >
                {example}
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    
    .pulse-animation {
      animation: pulse 2s infinite;
    }
    
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .shimmer {
      animation: shimmer 3s infinite;
    }
  </style>