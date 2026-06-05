import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create asset
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, type, value, description, acquiredDate } = req.body;

    const asset = await prisma.asset.create({
      data: {
        userId,
        name,
        type,
        value,
        description,
        acquiredDate: acquiredDate ? new Date(acquiredDate) : null,
      },
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// Get all assets
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const assets = await prisma.asset.findMany({
      where: { userId },
      include: { valueHistory: { orderBy: { date: 'desc' }, take: 5 } },
    });

    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// Get net worth
router.get('/summary/net-worth', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const assets = await prisma.asset.findMany({
      where: { userId },
    });

    const totalNetWorth = assets.reduce((sum, asset) => sum + asset.value, 0);

    const byType: any = {};
    assets.forEach((asset) => {
      byType[asset.type] = (byType[asset.type] || 0) + asset.value;
    });

    res.json({
      totalNetWorth,
      byType,
      assetCount: assets.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch net worth' });
  }
});

// Update asset value
router.post('/:id/value-history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { value, notes } = req.body;

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset || asset.userId !== userId) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Record value history
    const history = await prisma.assetValueHistory.create({
      data: {
        assetId: id,
        value,
        notes,
      },
    });

    // Update asset current value
    await prisma.asset.update({
      where: { id },
      data: { value, updatedAt: new Date() },
    });

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update asset value' });
  }
});

// Get asset growth
router.get('/:id/growth', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { days = 365 } = req.query;

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset || asset.userId !== userId) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const history = await prisma.assetValueHistory.findMany({
      where: {
        assetId: id,
        date: { gte: since },
      },
      orderBy: { date: 'asc' },
    });

    const growth = history.length > 1 ? history[history.length - 1].value - history[0].value : 0;
    const growthPercentage = history.length > 1 ? (growth / history[0].value) * 100 : 0;

    res.json({
      asset,
      history,
      growth,
      growthPercentage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch growth data' });
  }
});

export default router;
