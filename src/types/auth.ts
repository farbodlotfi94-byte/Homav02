/**
 * User Authentication Types
 * Matches backend API responses from /api/users/* endpoints
 */

export interface User {
  id: number;
  phone_number: string;  // Normalized format: +989XXXXXXXXX
  name?: string;
  created_at: string;    // ISO 8601 timestamp
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;    // Seconds until access token expires (1800 = 30 min)
  user: User;
}

export interface LoginCredentials {
  phone_number: string;  // Can be 09XX, +989XX, or 989XX format
  password: string;      // Minimum 6 characters
}

export interface RegisterCredentials {
  phone_number: string;  // Can be 09XX, +989XX, or 989XX format
  password: string;      // Minimum 6 characters
  name?: string;         // Optional display name
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token?: string;  // Optional: omit to logout all devices
}

export interface UserProfile {
  id: number;
  phone_number: string;
  name?: string;
  created_at: string;
}

export interface UpdateProfileRequest {
  name?: string;
  password?: string;
}

/**
 * Storage keys for localStorage
 */
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'homa_user_access_token',
  REFRESH_TOKEN: 'homa_user_refresh_token',
  USER_DATA: 'homa_user_data',
} as const;

/**
 * API Error response type
 */
export interface AuthError {
  detail: string;
  message?: string;
  statusCode: number;
}
