import * as dotenv from 'dotenv';
dotenv.config();

import './admin';

// Health check
export { healthCheck } from './fn/healthCheck';
