import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  requestNotificationPermission, 
  callManageFcmToken,
  callSendTestNotification,
  getCurrentFcmToken,
  syncFcmToken,
} from '@/lib/firebase';
import { onServiceWorkerUpdate } from '@/lib/serviceWorkerManager';
import { useToast } from './useToast';

interface UsePushNotificationSettingsOptions {
  userId: string | null;
}

interface UsePushNotificationSettingsResult {
  // State
  browserPermission: NotificationPermission;
  isEnabled: boolean;
  isLoading: boolean;
  
  // Actions
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  sendTest: () => Promise<void>;
}

export function usePushNotificationSettings({ 
  userId 
}: UsePushNotificationSettingsOptions): UsePushNotificationSettingsResult {
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  
  // Store current device's token
  const currentTokenRef = useRef<string | null>(null);

  // Check notification status on mount and when permission changes
  // Also sync token with server to handle PWA updates that might have invalidated the token
  useEffect(() => {
    async function checkAndSyncStatus() {
      if (typeof Notification === 'undefined') return;
      
      setBrowserPermission(Notification.permission);
      
      if (Notification.permission === 'granted' && userId) {
        // Try to get token - if we can, notifications are enabled for this device
        const token = await getCurrentFcmToken();
        currentTokenRef.current = token;
        setIsEnabled(!!token);
        
        // Sync token with server - this will re-register if the token changed
        // (e.g., after a PWA update that created a new push subscription)
        if (token) {
          const syncResult = await syncFcmToken();
          if (syncResult.action === 'registered') {
            console.log('[usePushNotificationSettings] Token was re-registered after sync');
          }
        }
      } else {
        setIsEnabled(false);
      }
    }
    
    checkAndSyncStatus();
  }, [userId]);

  // Listen for service worker updates and re-sync token
  // This handles the case where a PWA update invalidates the FCM token
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onServiceWorkerUpdate(async () => {
      console.log('[usePushNotificationSettings] Service worker updated, syncing FCM token...');
      
      if (Notification.permission !== 'granted') {
        console.log('[usePushNotificationSettings] Notifications not granted, skipping sync');
        return;
      }

      // Small delay to let the new SW settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const syncResult = await syncFcmToken();
        
        if (syncResult.action === 'registered') {
          console.log('[usePushNotificationSettings] Token re-registered after SW update');
          currentTokenRef.current = syncResult.token;
        } else if (syncResult.action === 'error') {
          console.error('[usePushNotificationSettings] Token sync failed after SW update:', syncResult.message);
        }
      } catch (error) {
        console.error('[usePushNotificationSettings] Error syncing token after SW update:', error);
      }
    });

    return unsubscribe;
  }, [userId]);

  const enable = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Request browser permission and get token
      const token = await requestNotificationPermission();
      
      // Update browser permission state
      if (typeof Notification !== 'undefined') {
        setBrowserPermission(Notification.permission);
      }
      
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: Notification.permission === 'denied' 
            ? 'Notifications are blocked. Please enable them in your browser settings.'
            : 'Could not get notification permission. Make sure VAPID key is configured.',
        });
        return;
      }

      // Store token and register with backend
      currentTokenRef.current = token;
      await callManageFcmToken({ token, action: 'register' });
      setIsEnabled(true);

      toast({
        title: 'Notifications Enabled',
        description: 'You will receive push notifications.',
      });
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to enable notifications. Check console for details.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  const disable = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Get current token (from cache or fetch)
      let token = currentTokenRef.current;
      if (!token) {
        token = await getCurrentFcmToken();
      }
      
      if (!token) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not get device token to unregister.',
        });
        return;
      }

      // Unregister token with backend
      await callManageFcmToken({ token, action: 'unregister' });
      currentTokenRef.current = null;
      setIsEnabled(false);

      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications on this device.',
      });
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to disable notifications.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  const sendTest = useCallback(async () => {
    try {
      // Get current token to send to server for validation
      let token = currentTokenRef.current;
      if (!token) {
        token = await getCurrentFcmToken();
        currentTokenRef.current = token;
      }
      
      console.log('Sending test notification...');
      console.log('Current FCM token:', token?.substring(0, 20) + '...');
      console.log('User ID:', userId);
      
      // Send current token to server so it can verify it's registered
      const result = await callSendTestNotification({ currentToken: token || undefined });
      console.log('Test notification result:', result);
      
      // Check if the result indicates token issues
      const data = result.data;
      
      if (data.success && !data.tokenFound && token) {
        toast({
          variant: 'destructive',
          title: 'Token Not Registered',
          description: `Your device token is not registered. Try disabling and re-enabling notifications. (${data.successCount}/${data.totalTokens} tokens succeeded)`,
        });
      } else if (data.success) {
        toast({
          title: 'Test Sent',
          description: `Notification sent to ${data.successCount} device(s). Check your device for the notification.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Send Failed',
          description: 'All notification sends failed. Check console for logs.',
        });
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send test notification. Check console for logs.',
      });
    }
  }, [toast, userId]);

  return {
    browserPermission,
    isEnabled,
    isLoading,
    enable,
    disable,
    sendTest,
  };
}
