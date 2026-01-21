import { useState, useEffect, useCallback, useRef } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  auth,
  googleProvider,
  callGetUserDetails,
  callManageFcmToken,
  requestNotificationPermission,
} from '@/lib/firebase';
import type { UserProfile } from '@firebase-boilerplate/shared';

export type { UserProfile };

interface UseAuthResult {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Track if we've already requested notification permission this session
  const hasRequestedNotifications = useRef(false);

  // Fetch or create user profile from backend
  const fetchProfile = useCallback(async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const result = await callGetUserDetails({
        email: firebaseUser.email || undefined,
        displayName: firebaseUser.displayName || undefined,
        photoUrl: firebaseUser.photoURL || undefined,
      });
      return result.data;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      return null;
    }
  }, []);

  // Request notification permission and register FCM token
  const setupNotifications = useCallback(async () => {
    if (hasRequestedNotifications.current) return;
    hasRequestedNotifications.current = true;

    try {
      console.log('[useAuth] Requesting notification permission...');
      const token = await requestNotificationPermission();
      
      if (token) {
        console.log('[useAuth] FCM token obtained, registering with backend...');
        await callManageFcmToken({ token, action: 'register' });
        console.log('[useAuth] FCM token registered successfully');
      } else {
        console.log('[useAuth] No FCM token obtained (permission denied or not supported)');
      }
    } catch (err) {
      console.error('[useAuth] Failed to setup notifications:', err);
      // Don't set error state - notifications are optional
    }
  }, []);

  // Refresh profile from backend
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const newProfile = await fetchProfile(user);
    if (newProfile) {
      setProfile(newProfile);
    }
  }, [user, fetchProfile]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch profile
        const userProfile = await fetchProfile(firebaseUser);
        setProfile(userProfile);
        
        // Setup notifications after profile is loaded
        setupNotifications();
      } else {
        setProfile(null);
        hasRequestedNotifications.current = false;
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchProfile, setupNotifications]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign in failed:', err);
      setError(err instanceof Error ? err : new Error('Sign in failed'));
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut(auth);
      setProfile(null);
      hasRequestedNotifications.current = false;
    } catch (err) {
      console.error('Sign out failed:', err);
      setError(err instanceof Error ? err : new Error('Sign out failed'));
      throw err;
    }
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };
}
