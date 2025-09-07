/**
 * Memory management utilities
 * Helps manage memory usage in the app
 */

export class MemoryManager {
  private static movieCache = new Map<number, any>()
  private static MAX_CACHE_SIZE = 50

  /**
   * Check current memory usage (approximate)
   */
  static getMemoryUsage(): { used: number; limit: number } {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const performance = window.performance as any
      if (performance.memory) {
        return {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // Convert to MB
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        }
      }
    }
    return { used: 0, limit: 0 }
  }

  /**
   * Cache a movie with automatic cleanup
   */
  static cacheMovie(movieId: number, movieData: any): void {
    // Remove oldest entries if cache is too large
    if (this.movieCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.movieCache.keys().next().value
      this.movieCache.delete(firstKey)
    }
    this.movieCache.set(movieId, movieData)
  }

  /**
   * Get cached movie
   */
  static getCachedMovie(movieId: number): any | null {
    return this.movieCache.get(movieId) || null
  }

  /**
   * Clear movie cache
   */
  static clearCache(): void {
    this.movieCache.clear()
  }

  /**
   * Optimize image URL for memory efficiency
   */
  static getOptimizedImageUrl(path: string | null, viewportWidth: number): string | null {
    if (!path) return null
    
    const baseUrl = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p'
    
    // Choose appropriate size based on viewport
    let size = 'w500'
    if (viewportWidth < 640) {
      size = 'w300'
    } else if (viewportWidth > 1280) {
      size = 'w780'
    }
    
    return `${baseUrl}/${size}${path}`
  }

  /**
   * Cleanup unused resources
   */
  static cleanup(): void {
    this.clearCache()
    
    // Trigger garbage collection if available (mostly for development)
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc()
    }
  }
}