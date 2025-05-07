/**
 * Utility functions for search functionality
 */

// Popular image examples that users can quickly select
export const POPULAR_EXAMPLES = [
  'nginx:latest',
  'ubuntu:22.04',
  'postgres:15',
  'node:22',
  'mongo:latest'
];

/**
 * Store recent searches in local storage (limited to last 5)
 */
export function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  
  try {
    const recentSearches = getRecentSearches();
    
    // Don't add duplicates - remove existing entry if present
    const filteredSearches = recentSearches.filter(item => item !== query);
    
    // Add new search to beginning and limit to 5 items
    const updatedSearches = [query, ...filteredSearches].slice(0, 5);
    
    localStorage.setItem('recent-searches', JSON.stringify(updatedSearches));
  } catch (e) {
    // Silently fail if localStorage isn't available
    console.warn('Could not save recent search');
  }
}

/**
 * Get recent searches from local storage
 */
export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const searches = localStorage.getItem('recent-searches');
    return searches ? JSON.parse(searches) : [];
  } catch (e) {
    // Return empty array if localStorage isn't available or data is invalid
    return [];
  }
}

/**
 * Clear recent searches from local storage
 */
export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('recent-searches');
  } catch (e) {
    // Silently fail if localStorage isn't available
    console.warn('Could not clear recent searches');
  }
}
