import { Router } from 'express';
import { realtimeController } from './realtime.controller';

const router = Router();

router.get('/events', realtimeController.getEvents);
router.post('/simulate', realtimeController.triggerSimulation);

export const realtimeRoutes = router;
