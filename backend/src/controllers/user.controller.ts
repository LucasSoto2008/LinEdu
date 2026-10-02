import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 20,
    });
    
    // Add rank and medal logic
    const leaderboard = users.map((u, index) => {
      let medal = undefined;
      if (index === 0) medal = '🥇';
      else if (index === 1) medal = '🥈';
      else if (index === 2) medal = '🥉';

      return {
        id: u.id.toString(),
        name: u.name,
        streak: u.streak,
        xp: u.xp,
        rank: index + 1,
        medal,
        isYou: u.email === 'test@test.com' // Hardcoded current user for demo
      };
    });

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@test.com' } // Hardcoded current user for demo
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Determine rank by counting users with more XP
    const higherXpCount = await prisma.user.count({
      where: { xp: { gt: user.xp } }
    });

    res.json({
      ...user,
      rank: higherXpCount + 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
