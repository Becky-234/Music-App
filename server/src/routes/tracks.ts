import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../lib/db.js';

const router = Router();

// Configure multer to save files to the 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename: timestamp-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// UPLOAD A TRACK
router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // The rest of the metadata comes from the form body
    const { title, artist, duration } = req.body;

    const track = await prisma.track.create({
      data: {
        title: title || 'Untitled',
        artist: artist || 'Unknown Artist',
        duration: parseInt(duration) || 0,
        // Save the URL path that the frontend can access
        audioUrl: `/uploads/${req.file.filename}`, 
        coverUrl: null, // We'll add cover art later
      },
    });

    res.status(201).json(track);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload track' });
  }
});

// GET ALL TRACKS
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

export default router;