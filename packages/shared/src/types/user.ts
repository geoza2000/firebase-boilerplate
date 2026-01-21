import { z } from 'zod';

// User settings
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
}

// Notification settings
export interface NotificationSettings {
  fcmTokens: string[];
  emailNotifications: boolean;
}

// Core User interface
export interface User {
  userId: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  settings: UserSettings;
  notifications: NotificationSettings;
  createdAt: Date;
  updatedAt: Date;
}

// User document for Firestore
export interface UserDocument {
  userId: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  settings: UserSettings;
  notifications: NotificationSettings;
  createdAt: string;
  updatedAt: string;
}

// Create user input
export interface CreateUserInput {
  userId: string;
  email: string;
  displayName: string;
  photoUrl?: string | null;
}

// User profile returned to client (excludes sensitive data)
export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  settings: UserSettings;
  notifications: {
    enabled: boolean;
    tokenCount: number;
  };
}

// Zod schemas
export const UserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
});

export const NotificationSettingsSchema = z.object({
  fcmTokens: z.array(z.string()),
  emailNotifications: z.boolean(),
});

export const CreateUserSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  photoUrl: z.string().nullable().optional(),
});

// Helper functions
export function userToDocument(user: User): UserDocument {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function documentToUser(doc: UserDocument): User {
  return {
    ...doc,
    notifications: doc.notifications || getDefaultNotificationSettings(),
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

export function getDefaultUserSettings(): UserSettings {
  return { theme: 'system' };
}

export function getDefaultNotificationSettings(): NotificationSettings {
  return {
    fcmTokens: [],
    emailNotifications: false,
  };
}

export function userToProfile(user: User): UserProfile {
  return {
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user.photoUrl,
    settings: user.settings,
    notifications: {
      enabled: user.notifications.fcmTokens.length > 0,
      tokenCount: user.notifications.fcmTokens.length,
    },
  };
}
