import { createClient } from './api/base44Client';
// import { getAccessToken } from './api/base44Client/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68b8d90724709eb4dfd9a6ab", 
  requiresAuth: true // Ensure authentication is required for all operations
});
