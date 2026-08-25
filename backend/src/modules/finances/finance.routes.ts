import { Router } from 'express';
import { financeController } from './finance.controller';

export const financeRoutes = Router();

financeRoutes.get('/', financeController.getAll);
financeRoutes.post('/', financeController.create);
financeRoutes.post('/import-statement', financeController.importStatement);
financeRoutes.delete('/', financeController.truncateAll);
financeRoutes.delete('/:id', financeController.delete);
