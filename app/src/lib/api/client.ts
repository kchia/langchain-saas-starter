/**
 * Axios API client configuration with interceptors.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APIErrorResponse, RateLimitError } from '@/types';

// Get API URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000, // 30s for uploads, can be overridden per request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any auth headers here in the future if needed
    // For now, just log the request
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error transformation
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error: AxiosError<APIErrorResponse>) => {
    // Transform API errors into user-friendly messages
    if (error.response) {
      // Server responded with error status
      const { status, data, headers } = error.response;
      
      // Handle rate limiting (Epic 003 Story 3.3)
      if (status === 429) {
        // Parse Retry-After header (in seconds)
        const retryAfterHeader = headers['retry-after'];
        const parsedRetryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
        const retryAfter = !isNaN(parsedRetryAfter) ? parsedRetryAfter : 60; // default to 60 seconds if invalid
        
        let message = typeof data?.detail === 'string' 
          ? data.detail 
          : 'Rate limit exceeded. Please try again in a moment.';
        
        // Extract endpoint from URL if available
        const endpoint = error.config?.url;
        
        // Create rate limit error
        const rateLimitError = new RateLimitError(
          message,
          retryAfter,
          endpoint
        );
        
        if (process.env.NODE_ENV === 'development') {
          console.error(`[API Rate Limit] ${status}: ${message} (retry after ${retryAfter}s)`);
        }
        
        return Promise.reject(rateLimitError);
      }
      
      let message: string;
      if (typeof data?.detail === 'string') {
        message = data.detail;
        
        // Enhanced error messages for specific security scenarios (Epic 003 Story 3.1)
        if (message.toLowerCase().includes('pii')) {
          message = '🔒 Security Alert: This image contains personally identifiable information (PII) and cannot be processed for privacy protection.';
        } else if (message.toLowerCase().includes('svg') && message.toLowerCase().includes('forbidden')) {
          message = '⚠️ Security Alert: This SVG file contains potentially malicious content (scripts or embedded code) and has been blocked for your safety.';
        } else if (message.toLowerCase().includes('file type') || message.toLowerCase().includes('invalid file')) {
          message = '📄 Invalid File Type: Please upload PNG, JPG, or SVG files only.';
        } else if (message.toLowerCase().includes('file size') || message.toLowerCase().includes('too large')) {
          message = '📦 File Too Large: Please compress your image to under 10MB.';
        } else if (message.toLowerCase().includes('image too small')) {
          message = '📐 Image Too Small: Please upload an image at least 50x50 pixels.';
        } else if (message.toLowerCase().includes('resolution too high') || message.toLowerCase().includes('memory exhaustion')) {
          message = '📐 Image Resolution Too High: Please use an image with fewer than 25 million pixels to prevent memory issues.';
        } else if (message.toLowerCase().includes('corrupted') || message.toLowerCase().includes('invalid image')) {
          message = '❌ Corrupted Image: This file appears to be corrupted or is not a valid image. Please try a different file.';
        } else if (message.toLowerCase().includes('mime type') && message.toLowerCase().includes('mismatch')) {
          message = '⚠️ File Type Mismatch: The file extension doesn\'t match the actual file content. This may indicate a security risk.';
        }
      } else if (typeof data?.detail === 'object') {
        // Validation errors from FastAPI
        message = 'Validation error. Please check your input.';
      } else {
        message = `Request failed with status ${status}`;
      }

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error] ${status}: ${message}`);
      }

      // Create new error with friendly message
      const apiError = new Error(message);
      (apiError as any).status = status;
      (apiError as any).originalError = error;
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request made but no response received
      const networkError = new Error(
        'Unable to connect to server. Please check your connection.'
      );
      (networkError as any).originalError = error;
      return Promise.reject(networkError);
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

// Helper to set timeout for specific requests
export function createLongTimeoutClient() {
  const client = axios.create({
    ...apiClient.defaults,
    timeout: 60000, // 60s for long-running operations
  });
  
  // Apply same interceptors
  client.interceptors.request = apiClient.interceptors.request;
  client.interceptors.response = apiClient.interceptors.response;
  
  return client;
}
