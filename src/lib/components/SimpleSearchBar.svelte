<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { POPULAR_EXAMPLES, getRecentSearches, saveRecentSearch } from '$lib/utils/searchUtils';
  
  // Props
  export let onSearch: (query: string) => void;
  export let placeholder = "Search for an image (e.g. nginx:latest)";
  export let showExamples = true;
  export let showRecents = true;
  
  // State
  let searchQuery = '';
  let isSearching = false;
  let isFocused = false;
  let showSuggestions = false;
  let recentSearches: string[] = [];
  let inputElement: HTMLInputElement;
  
  onMount(() => {
    // Load recent searches on mount (only in browser)
    recentSearches = getRecentSearches();
  });
  
  // Functions
  function handleSearch() {
    if (!searchQuery.trim()) return;
    
    isSearching = true;
    
    saveRecentSearch(searchQuery);
    
    recentSearches = getRecentSearches();
    
    // Call the search handler
    onSearch(searchQuery);
    
    // Reset state after a short delay
    setTimeout(() => {
      isSearching = false;
      showSuggestions = false;
    }, 300);
  }
  
  function selectSuggestion(suggestion: string) {
    searchQuery = suggestion;
    inputElement?.focus();
    showSuggestions = false;
  }
  
  function handleFocus() {
    isFocused = true;
    if ((showRecents && recentSearches.length > 0) || showExamples) {
      showSuggestions = true;
    }
  }
  
  function handleBlur() {
    isFocused = false;
    // Small delay to allow clicking suggestions
    setTimeout(() => {
      showSuggestions = false;
    }, 200);
  }
  
  function handleClear() {
    searchQuery = '';
    inputElement?.focus();
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      showSuggestions = false;
    } else if (event.key === 'Enter') {
      handleSearch();
    }
  }
</script>

<div class="search-container">
  <!-- Search Form -->
  <form on:submit|preventDefault={handleSearch} class="relative">
    <div class={`search-input-container ${isFocused ? 'focused' : ''}`}>
      <!-- Search Icon -->
      <button 
        type="submit" 
        class="search-button" 
        disabled={isSearching}
        aria-label="Search"
      >
        {#if isSearching}
          <div class="spinner"></div>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        {/if}
      </button>
      
      <!-- Search Input -->
      <input
        bind:this={inputElement}
        type="text"
        bind:value={searchQuery}
        on:focus={handleFocus}
        on:blur={handleBlur}
        on:keydown={handleKeydown}
        placeholder={placeholder}
        class="search-input"
      />
      
      <!-- Clear Button (only show when there's text) -->
      {#if searchQuery}
        <button
          type="button"
          on:click={handleClear}
          class="clear-button"
          aria-label="Clear search"
          in:fade={{ duration: 150 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      {/if}
    </div>
    
    <!-- Suggestions dropdown -->
    {#if showSuggestions && (showRecents || showExamples)}
      <div class="suggestions-container" transition:fade={{ duration: 150 }}>
        <!-- Recent Searches -->
        {#if showRecents && recentSearches.length > 0}
          <div class="suggestion-section">
            <div class="suggestion-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="suggestion-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Recent Searches
            </div>
            <div class="suggestion-list">
              {#each recentSearches as recent}
                <button 
                  type="button" 
                  class="suggestion-item"
                  on:click={() => selectSuggestion(recent)}
                >
                  {recent}
                </button>
              {/each}
            </div>
          </div>
        {/if}
        
        <!-- Examples -->
        {#if showExamples}
          <div class="suggestion-section">
            <div class="suggestion-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="suggestion-icon">
                <path d="M12 5v14"></path>
                <path d="M18 13l-6 6"></path>
                <path d="M6 13l6 6"></path>
              </svg>
              Popular Examples
            </div>
            <div class="suggestion-list">
              {#each POPULAR_EXAMPLES as example}
                <button 
                  type="button" 
                  class="suggestion-item example"
                  on:click={() => selectSuggestion(example)}
                >
                  {example}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </form>
</div>

<style>
  /* Search Container */
  .search-container {
    width: 100%;
    max-width: 36rem;
    margin: 0 auto;
  }
  
  /* Search Input Container */
  .search-input-container {
    display: flex;
    align-items: center;
    background-color: rgba(15, 23, 42, 0.9);
    border: 2px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.75rem;
    transition: all 0.2s ease;
    overflow: hidden;
    backdrop-filter: blur(8px);
  }
  
  .search-input-container.focused {
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
  
  /* Search Button */
  .search-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1rem;
    color: rgb(148, 163, 184);
    transition: color 0.2s ease;
  }
  
  .search-button:hover {
    color: rgb(59, 130, 246);
  }
  
  .search-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  /* Spinner */
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-top-color: rgb(59, 130, 246);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Search Input */
  .search-input {
    flex-grow: 1;
    background: transparent;
    border: none;
    padding: 0.75rem 0.5rem;
    color: white;
    font-size: 1rem;
    width: 100%;
    outline: none;
  }
  
  .search-input::placeholder {
    color: rgb(148, 163, 184);
  }
  
  /* Clear Button */
  .clear-button {
    padding: 0.5rem;
    color: rgb(148, 163, 184);
    margin-right: 0.5rem;
    border-radius: 9999px;
    transition: all 0.2s ease;
  }
  
  .clear-button:hover {
    color: white;
    background-color: rgba(71, 85, 105, 0.5);
  }
  
  /* Suggestions Container */
  .suggestions-container {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background-color: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(71, 85, 105, 0.7);
    border-radius: 0.5rem;
    overflow: hidden;
    z-index: 50;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
  }
  
  /* Suggestion Sections */
  .suggestion-section:not(:last-child) {
    border-bottom: 1px solid rgba(51, 65, 85, 0.7);
  }
  
  /* Suggestion Header */
  .suggestion-header {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgb(226, 232, 240);
    background-color: rgba(30, 41, 59, 0.7);
  }
  
  .suggestion-icon {
    margin-right: 0.5rem;
    color: rgb(59, 130, 246);
  }
  
  /* Suggestion List */
  .suggestion-list {
    padding: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  /* Suggestion Items */
  .suggestion-item {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    transition: all 0.2s ease;
    background-color: rgba(51, 65, 85, 0.5);
    color: rgb(226, 232, 240);
    text-align: left;
    white-space: nowrap;
  }
  
  .suggestion-item:hover {
    background-color: rgba(59, 130, 246, 0.3);
  }
  
  .suggestion-item.example {
    border: 1px solid rgba(59, 130, 246, 0.3);
    background-color: rgba(59, 130, 246, 0.1);
  }
  
  .suggestion-item.example:hover {
    background-color: rgba(59, 130, 246, 0.2);
  }
</style>
