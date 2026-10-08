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
