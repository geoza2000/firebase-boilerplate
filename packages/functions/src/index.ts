import * as dotenv from 'dotenv';
dotenv.config();

import './admin';

// Health check
export { healthCheck } from './fn/healthCheck';

// FCM Token management
export { manageFcmToken } from './fn/manageFcmToken';

// Test notification
export { sendTestNotification } from './fn/sendTestNotification';
