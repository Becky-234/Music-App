import { create } from 'zustand';

interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string | null;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setQueue: (tracks: Track[]) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],

  setQueue: (tracks) => set({ queue: tracks }),

  playTrack: (track) => set({ currentTrack: track, isPlaying: true }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  playNext: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack || queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    set({ currentTrack: queue[nextIndex], isPlaying: true });
  },

  playPrevious: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack || queue.length === 0) return;

    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    set({ currentTrack: queue[prevIndex], isPlaying: true });
  },
}));