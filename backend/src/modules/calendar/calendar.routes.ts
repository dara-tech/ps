import { Router } from 'express';
import { calendarController } from './calendar.controller';

const router = Router();

router.get('/', (req, res) => calendarController.getAll(req, res));
router.post('/', (req, res) => calendarController.create(req, res));
router.put('/:id', (req, res) => calendarController.update(req, res));
router.put('/:id/toggle', (req, res) => calendarController.toggle(req, res));
router.delete('/:id', (req, res) => calendarController.delete(req, res));

export const calendarRoutes = router;
