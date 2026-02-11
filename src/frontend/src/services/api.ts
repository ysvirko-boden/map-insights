/**
 * Generic API client utilities
 * Provides type-safe fetch wrapper and error handling
 */

import type { ApiErrorResponse, ValidationError } from '@/types/api';
import { auth } from '@/lib/firebase';

/**
 * API base URL from environment variable
 * Falls back to localhost for development
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Custom error class for API failures
 * Includes HTTP status code, validation errors, and optional error details
 */
export class ApiError extends Error {
  statusCode: number;
  validationErrors?: ValidationError[];
  details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    validationErrors?: ValidationError[],
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
    this.details = details;
  }
}

/**
 * Type-safe fetch wrapper with error handling
 * Handles JSON parsing, HTTP errors, and network failures
 * Automatically includes Firebase Auth token if user is authenticated
 *
 * @param url - Full URL or path relative to API_BASE_URL
 * @param method - HTTP method (GET, POST, etc.)
 * @param body - Request body (will be JSON stringified)
 * @param headers - Additional headers to include
 * @returns Parsed JSON response of type T
 * @throws ApiError with status code and details
 */
export async function fetchJson<T>(
  url: string,
  method: string = 'GET',
  body?: unknown,
  headers: Record<string, string> = {}
): Promise<T> {
  // Construct full URL if relative path provided
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  // Get Firebase auth token if user is authenticated
  const token = await auth.currentUser?.getIdToken();

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Parse JSON response
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      // Response is not JSON, use status text as error
      if (!response.ok) {
        throw new ApiError(
          response.statusText || 'Request failed',
          response.status
        );
      }
      throw new ApiError('Invalid JSON response', response.status);
    }

    // Handle HTTP errors
    if (!response.ok) {
      // Try to parse as structured error response
      const errorData = data as Partial<ApiErrorResponse>;
      const errorMessage =
        errorData.message || response.statusText || 'Request failed';
      const validationErrors = errorData.errors;

      throw new ApiError(
        errorMessage,
        response.status,
        validationErrors,
        data
      );
    }

    return data as T;
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError(
        'Network error: Unable to connect to server',
        0,
        undefined,
        error
      );
    }

    // Handle other unexpected errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0,
      undefined,
      error
    );
  }
}
