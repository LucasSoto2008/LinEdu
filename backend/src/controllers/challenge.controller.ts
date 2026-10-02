import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const challenges = [
  {
    id: 1,
    instruction: "Move notes.txt to /backup/ in interactive mode",
    validRegex: "^mv -i notes\\.txt /backup/?$",
    xpReward: 12,
    blocks: [ 'mv', '-i', 'notes.txt', '/backup/', 'cp', '-f', 'rm', './backup/' ]
  },
  {
    id: 2,
    instruction: "Copy the directory /var/log recursively to ./logs",
    validRegex: "^cp -r /var/log ./logs/?$",
    xpReward: 15,
    blocks: [ 'cp', '-r', '/var/log', './logs', 'mv', '-R', 'log', 'rm' ]
  },
  {
    id: 3,
    instruction: "Remove the directory /tmp/cache and all its contents forcefully",
    validRegex: "^rm -rf /tmp/cache/?$",
    xpReward: 15,
    blocks: [ 'rm', '-rf', '/tmp/cache', '-f', 'del', '/var/cache', 'mkdir', 'rmdir' ]
  },
  {
    id: 4,
    instruction: "Create a directory path /app/src/components, creating parents as needed",
    validRegex: "^mkdir -p /app/src/components/?$",
    xpReward: 12,
    blocks: [ 'mkdir', '-p', '/app/src/components', 'touch', 'make', '-d', 'src/' ]
  },
  {
    id: 5,
    instruction: "Make the file script.sh executable for everyone",
    validRegex: "^chmod \\+x script\\.sh$",
    xpReward: 20,
    blocks: [ 'chmod', '+x', 'script.sh', 'chown', '777', '-R', 'execute', 'sh' ]
  }
];

export const getChallenge = async (req: Request, res: Response) => {
  // Return all challenges instead of just one
  const formattedChallenges = challenges.map(c => ({
    id: c.id,
    instruction: c.instruction,
    xpReward: c.xpReward,
    blocks: c.blocks.map((text, i) => ({ id: String(i), text }))
  }));
  res.json(formattedChallenges);
};

export const validateCommand = async (req: Request, res: Response) => {
  const { challengeId, blocks, isLast } = req.body;
  
  const command = blocks.join(' ');
  const challenge = challenges.find(c => c.id === challengeId);

  if (!challenge) {
    return res.status(404).json({ error: "Challenge not found" });
  }

  const regex = new RegExp(challenge.validRegex);
  const isValid = regex.test(command);

  if (isValid) {
    const user = await prisma.user.findUnique({ where: { email: 'test@test.com' } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update XP
    let updateData: any = { xp: { increment: challenge.xpReward } };

    // Update streak if it's the last mission of the day
    let streakIncremented = false;
    if (isLast) {
      // Very basic streak logic: check if lastPlay was before today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastPlayDay = new Date(user.lastPlay);
      lastPlayDay.setHours(0, 0, 0, 0);

      if (lastPlayDay.getTime() < today.getTime() || user.streak === 0) {
        updateData.streak = { increment: 1 };
        updateData.lastPlay = new Date();
        streakIncremented = true;
      }
    }

    await prisma.user.update({
      where: { email: 'test@test.com' },
      data: updateData
    });

    res.json({ 
      success: true, 
      message: "Correct command!", 
      xpGained: challenge.xpReward,
      streakIncremented 
    });
  } else {
    res.json({ success: false, message: "Incorrect command. Try again." });
  }
};
