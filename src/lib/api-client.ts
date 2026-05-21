'use client'

import { env } from './env'

// Custom error type for API errors
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Central HTTP client for all API calls.
 * Handles credentials, error handling, and response parsing.
 *
 * @template T The response type
 * @param path The API endpoint path (e.g., '/users/{id}')
 * @param options Additional fetch options
 * @returns Parsed response of type T
 * @throws ApiError if the response status is not OK
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${env.NEXT_PUBLIC_API_BASE_URL}${path}`

  const response = await fetch(url, {
    credentials: 'include', // Include httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  // Handle non-OK responses
  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const error = await response.json()
      message = error.error || error.message || message
    } catch {
      // Response wasn't JSON, use status text
      message = response.statusText || message
    }
    throw new ApiError(response.status, message)
  }

  // Parse and return response
  return response.json() as Promise<T>
}

/**
 * Shorthand for GET requests
 */
export async function get<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET' })
}

/**
 * Shorthand for POST requests
 */
export async function post<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Shorthand for PUT requests
 */
export async function put<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/**
 * Shorthand for DELETE requests
 */
export async function del<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'DELETE' })
}
