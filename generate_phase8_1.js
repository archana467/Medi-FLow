const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const BACKEND_SRC = path.join(BASE_DIR, "backend", "src");

const files = {};

// 1. Metrics Service
files[path.join(BACKEND_SRC, "utils", "metrics.js")] = `
import client from 'prom-client';

// Create a Registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// HTTP Metrics
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});
register.registerMetric(httpRequestDurationMicroseconds);

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code']
});
register.registerMetric(httpRequestsTotal);

// Business Metrics
export const businessEventCounter = new client.Counter({
  name: 'mediflow_business_events_total',
  help: 'Total count of business events like appointment creation, invoice issuance',
  labelNames: ['event_type']
});
register.registerMetric(businessEventCounter);

export const getMetrics = async () => {
    return await register.metrics();
};
`;

// 2. Metrics Route
files[path.join(BACKEND_SRC, "routes", "metrics.routes.js")] = `
import express from 'express';
import { getMetrics } from '../utils/metrics.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.set('Content-Type', 'text/plain');
        res.end(await getMetrics());
    } catch (err) {
        res.status(500).end(err.toString());
    }
});

export default router;
`;

// 3. Request Correlation Middleware
files[path.join(BACKEND_SRC, "middleware", "requestLogger.middleware.js")] = `
import { v4 as uuidv4 } from 'uuid';

export const requestCorrelation = (req, res, next) => {
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
};
`;

// 4. Metrics Middleware
files[path.join(BACKEND_SRC, "middleware", "metrics.middleware.js")] = `
import { httpRequestDurationMicroseconds, httpRequestsTotal } from '../utils/metrics.js';

export const metricsMiddleware = (req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        // Basic route tracking, stripping IDs is important to avoid cardinality explosion
        // Assuming typical /api/resource/:id
        const route = req.route ? req.route.path : req.path; 
        httpRequestsTotal.inc({ method: req.method, route: route, code: res.statusCode });
        end({ method: req.method, route: route, code: res.statusCode });
    });
    next();
};
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 8 Backend metrics setup generated");
