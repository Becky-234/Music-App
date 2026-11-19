import { Router } from 'express';
import { prisma } from '../lib/db.js';
import jwt from 'jsonwebtoken';

const router = Router();

// Middleware to check if user is logged in
const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// CREATE A PLAYLIST
router.post('/', requireAuth, async (req: any, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Playlist name is required' });

    const playlist = await prisma.playlist.create({
      data: {
        name,
        ownerId: req.user.userId,
      },
    });
    res.status(201).json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// GET USER'S PLAYLISTS
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { ownerId: req.user.userId },
      include: {
        tracks: {
          include: { track: true },
          orderBy: { order: 'asc' }
        }
      }
    });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// ADD A TRACK TO A PLAYLIST
router.post('/:playlistId/tracks', requireAuth, async (req: any, res) => {
  try {
    const { playlistId } = req.params;
    const { trackId } = req.body;

    // Find the highest current order number
    const lastTrack = await prisma.playlistTrack.findFirst({
      where: { playlistId },
      orderBy: { order: 'desc' },
    });
    const nextOrder = lastTrack ? lastTrack.order + 1 : 0;

    const playlistTrack = await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId,
        order: nextOrder,
      },
    });
    res.status(201).json(playlistTrack);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add track to playlist' });
  }
});

export default router;