import { Request, Response } from 'express';
import { marketService } from './market.service';

export class MarketController {
  public async search(req: Request, res: Response): Promise<void> {
    try {
      const q = req.query.q ? String(req.query.q) : undefined;
      const category = req.query.category ? String(req.query.category) : undefined;
      const minPrice = req.query.minPrice ? parseFloat(String(req.query.minPrice)) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(String(req.query.maxPrice)) : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;

      const result = await marketService.searchListings({
        q,
        category,
        minPrice,
        maxPrice,
        limit,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[MarketController] search error:', error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  }

  public async evaluate(req: Request, res: Response): Promise<void> {
    try {
      const { item, targetGoalId } = req.body;
      if (!item || !item.title) {
        res.status(400).json({ success: false, error: 'Item data with title is required' });
        return;
      }

      const evaluation = await marketService.evaluateDeal(item, targetGoalId);
      res.status(200).json({ success: true, data: evaluation });
    } catch (error) {
      console.error('[MarketController] evaluate error:', error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  }

  public async getTopDeals(req: Request, res: Response): Promise<void> {
    try {
      const deals = await marketService.getTopDeals();
      res.status(200).json({ success: true, data: deals });
    } catch (error) {
      console.error('[MarketController] getTopDeals error:', error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  }

  public async getItemDetails(req: Request, res: Response): Promise<void> {
    try {
      const url = req.query.url ? String(req.query.url) : '';
      if (!url) {
        res.status(400).json({ success: false, error: 'url is required' });
        return;
      }

      const details = await marketService.getItemDetails(url);
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      console.error('[MarketController] getItemDetails error:', error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  }

  public async getGoals(req: Request, res: Response): Promise<void> {
    try {
      const goals = marketService.getGoals();
      res.status(200).json({ success: true, data: goals });
    } catch (error) {
      console.error('[MarketController] getGoals error:', error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  }

  public async createGoal(req: Request, res: Response): Promise<void> {
    try {
      const { title, category, maxBudget, minBudget, targetSpecs, priority, linkedProjectId, justification } = req.body;
      if (!title || !category || maxBudget === undefined) {
        res.status(400).json({ success: false, error: 'title, category, and maxBudget are required' });
        return;
      }

      const newGoal = marketService.createGoal({
        title,
        category,
        maxBudget: Number(maxBudget),
        minBudget: minBudget ? Number(minBudget) : 0,
        targetSpecs,
        priority: priority || 'medium',
        linkedProjectId,
        justification,
        status: 'active',
      });

      res.status(201).json({ success: true, data: newGoal });
    } catch (error) {
      console.error('[MarketController] createGoal error:', error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  }

  public async updateGoal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updated = marketService.updateGoal(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Buying goal not found' });
        return;
      }
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error('[MarketController] updateGoal error:', error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  }

  public async deleteGoal(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      marketService.deleteGoal(id);
      res.status(200).json({ success: true, message: 'Buying goal deleted' });
    } catch (error) {
      console.error('[MarketController] deleteGoal error:', error);
      res.status(500).json({ success: false, error: (error as any).message });
    }
  }
}

export const marketController = new MarketController();
