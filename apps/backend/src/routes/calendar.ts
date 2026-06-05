import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get calendar events
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { startDate, endDate } = req.query;

    let where: any = { userId };

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate)),
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Create calendar event
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, description, startTime, endTime, type } = req.body;

    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type,
      },
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Get weekly view
router.get('/week/:weekStart', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { weekStart } = req.params;

    const startDate = new Date(weekStart);
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ weekStart, events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weekly view' });
  }
});

// Get daily view
router.get('/day/:date', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { date } = req.params;

    const dayStart = new Date(date);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId,
        startTime: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const dailyActions = await prisma.dailyAction.findMany({
      where: {
        date: { gte: dayStart, lt: dayEnd },
      },
    });

    res.json({ date, events, dailyActions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily view' });
  }
});

export default router;
