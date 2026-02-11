/**
 * Generic API response types
 * Provides type safety for API communication
 */

/**
 * Successful API response wrapper
 * @template T - Type of the response data
 */
export type ApiResponse<T> = {
  data: T;
  error?: never;
};

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Error response from API
 * Includes optional validation errors for form submissions
 */
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  errors?: ValidationError[];
}
