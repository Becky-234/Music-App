import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../lib/db.js';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// UPDATE: Add .fields() to accept both 'audio' and 'cover'
router.post('/upload', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req: any, res) => {
  try {
    // req.files is now an object with 'audio' and 'cover' arrays
    if (!req.files || !req.files['audio']) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { title, artist, duration } = req.body;
    
    const audioFile = req.files['audio'][0];
    const coverFile = req.files['cover'] ? req.files['cover'][0] : null;

    const track = await prisma.track.create({
      data: {
        title: title || 'Untitled',
        artist: artist || 'Unknown Artist',
        duration: parseInt(duration) || 0,
        audioUrl: `/uploads/${audioFile.filename}`, 
        // Save the cover URL if a file was uploaded
        coverUrl: coverFile ? `/uploads/${coverFile.filename}` : null,
      },
    });

    res.status(201).json(track);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload track' });
  }
});

// GET ALL TRACKS (remains the same)
router.get('/', async (req, res) => {
  try {
    const tracks = await prisma.track.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// SEARCH TRACKS
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      return res.json([]); // Return empty array if no query
    }

    const tracks = await prisma.track.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { artist: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20, // Limit results
    });

    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
});

export default router;