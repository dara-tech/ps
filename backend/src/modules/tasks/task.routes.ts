import { Router } from 'express';
import { taskController } from './task.controller';

const router = Router();

router.get('/', taskController.getAll);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.patch('/:id', taskController.update);
router.patch('/:id/status', taskController.updateStatus);
router.delete('/:id', taskController.delete);

export const taskRoutes = router;
