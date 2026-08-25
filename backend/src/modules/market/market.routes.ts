import { Router } from 'express';
import { marketController } from './market.controller';

const router = Router();

// Search & Deal Evaluation
router.get('/search', (req, res) => marketController.search(req, res));
router.get('/deals', (req, res) => marketController.getTopDeals(req, res));
router.get('/item-details', (req, res) => marketController.getItemDetails(req, res));
router.post('/evaluate', (req, res) => marketController.evaluate(req, res));

// Buying Goals CRUD
router.get('/goals', (req, res) => marketController.getGoals(req, res));
router.post('/goals', (req, res) => marketController.createGoal(req, res));
router.put('/goals/:id', (req, res) => marketController.updateGoal(req, res));
router.delete('/goals/:id', (req, res) => marketController.deleteGoal(req, res));

export const marketRouter = router;
