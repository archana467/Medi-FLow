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
