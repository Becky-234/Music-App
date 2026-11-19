import { create } from 'zustand';
import { api } from '../lib/api';

interface Playlist {
  id: string;
  name: string;
  tracks: { track: any }[];
}

interface PlaylistState {
  playlists: Playlist[];
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (name: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  
  fetchPlaylists: async () => {
    try {
      const res = await api.get('/playlists');
      set({ playlists: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  createPlaylist: async (name) => {
    try {
      await api.post('/playlists', { name });
      get().fetchPlaylists(); // Refresh list
    } catch (err) {
      console.error(err);
    }
  },

  addTrackToPlaylist: async (playlistId, trackId) => {
    try {
      await api.post(`/playlists/${playlistId}/tracks`, { trackId });
      get().fetchPlaylists(); // Refresh to show new track
    } catch (err) {
      console.error(err);
    }
  }
}));