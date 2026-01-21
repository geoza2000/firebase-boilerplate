import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import { createUser } from '../services/userService';
import { userToProfile } from '@firebase-boilerplate/shared';
import type { CreateUserInput } from '@firebase-boilerplate/shared';
import '../admin'; // Ensure admin is initialized

/**
 * Callable function to get user details (creates user if doesn't exist)
 * Called on app initialization to ensure user document exists
 */
export const getUserDetails = onCall({ 
  region: 'us-central1',
  cors: true,
  invoker: 'public',
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { email, displayName, photoUrl } = (request.data || {}) as {
    email?: string;
    displayName?: string;
    photoUrl?: string;
  };

  const input: CreateUserInput = {
    userId: request.auth.uid,
    email: email || request.auth.token.email || '',
    displayName: displayName || request.auth.token.name || 'User',
    photoUrl: photoUrl || request.auth.token.picture || null,
  };

  logger.info('Get user details', { userId: input.userId });

  // Creates user if doesn't exist, otherwise returns existing
  const user = await createUser(input);

  // Return profile (excludes sensitive data like FCM tokens)
  return userToProfile(user);
});
