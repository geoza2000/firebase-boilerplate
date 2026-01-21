import { z } from 'zod';

// User settings
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
}

// Core User interface
export interface User {
  userId: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  settings: UserSettings;
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

// Zod schemas
export const UserSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
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
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

export function getDefaultUserSettings(): UserSettings {
  return { theme: 'system' };
}
