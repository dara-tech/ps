import { Router } from 'express';
import { projectController } from './project.controller';

const router = Router();

router.get('/', projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', projectController.create);
router.patch('/:id/milestones/:milestoneId', projectController.toggleMilestone);

export const projectRoutes = router;
