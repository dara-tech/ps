import { Router } from 'express';
import { financeController } from './finance.controller';

export const financeRoutes = Router();

financeRoutes.get('/', financeController.getAll);
financeRoutes.post('/', financeController.create);
financeRoutes.delete('/:id', financeController.delete);
