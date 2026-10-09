import express from 'express';
import { getNearbyFacilities, searchDoctors, getDoctorById } from '../controllers/external.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Both endpoints are protected by authentication, requiring a logged-in user
router.use(requireAuth);

router.get('/facilities/nearby', getNearbyFacilities);
router.get('/doctors/search', searchDoctors);
router.get('/doctors/:id', getDoctorById);

export default router;
