/**
 * Central export for all type definitions
 */

export * from './movie'
export * from './preferences'

// Common utility types
export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: Error | null
}

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export type SwipeAction = 'like' | 'dislike' | 'skip'

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}