import { onRequest } from 'firebase-functions/v2/https';
import type { HealthCheckResponse } from '@$$PROJECT_NAME$$/shared';
import { db } from '../admin';
import * as fs from 'fs';
import * as path from 'path';

// Read version from package.json at startup
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')
);
const VERSION = packageJson.version;

/**
 * Health check endpoint - GET /healthCheck
 */
export const healthCheck = onRequest({
  region: 'us-central1',
  cors: true,
}, async (_req, res) => {
  let firestoreStatus: HealthCheckResponse['firestore'] = {
    status: 'error',
  };

  // Check Firestore health
  const startTime = Date.now();
  try {
    // Perform a simple read operation to verify Firestore connectivity
    await db.collection('_health').doc('ping').get();
    firestoreStatus = {
      status: 'ok',
      latencyMs: Date.now() - startTime,
    };
  } catch (error) {
    firestoreStatus = {
      status: 'error',
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  const response: HealthCheckResponse = {
    status: firestoreStatus.status === 'ok' ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    version: VERSION,
    firestore: firestoreStatus,
  };
  
  res.status(firestoreStatus.status === 'ok' ? 200 : 503).json(response);
});
