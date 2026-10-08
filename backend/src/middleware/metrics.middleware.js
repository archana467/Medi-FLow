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
