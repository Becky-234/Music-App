import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { usePlaylistStore } from '../store/playlistStore';

// Define types to satisfy Vercel's strict TypeScript
interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string | null;
}

interface Playlist {
  id: string;
  name: string;
  tracks: { track: Track }[];
}

export default function Library() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const user = useAuthStore((state) => state.user);
  const { playTrack, setQueue, currentTrack, togglePlay } = usePlayerStore();
  
  const { playlists, fetchPlaylists, createPlaylist, addTrackToPlaylist } = usePlaylistStore();

  // Wrap fetchTracks in useCallback so it can be safely used in useEffect
  const fetchTracks = useCallback(async () => {
    try {
      const res = await api.get('/tracks');
      setTracks(res.data);
      setQueue(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [setQueue]);

  useEffect(() => {
    fetchTracks();
    if (user) fetchPlaylists();
  }, [user, fetchTracks, fetchPlaylists]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', title);
    formData.append('artist', artist);
    if (coverFile) {
      formData.append('cover', coverFile);
    }
    
    try {
      await api.post('/tracks/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFile(null); 
      setTitle(''); 
      setArtist('');
      setCoverFile(null);
      fetchTracks(); 
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName);
    setNewPlaylistName('');
  };

  const handlePlayPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length === 0) return;
    const playlistTracks = playlist.tracks.map((pt) => pt.track);
    setQueue(playlistTracks);
    playTrack(playlistTracks[0]);
  };

  // Use the environment variable for the API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <h1 className="text-3xl font-bold text-green-500 mb-6">Your Library</h1>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LEFT COLUMN: PLAYLISTS */}
        {user && (
          <div className="w-full md:w-1/3">
            <div className="bg-[#18181b] p-4 rounded-lg border border-gray-800 mb-6">
              <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
              
              <form onSubmit={handleCreatePlaylist} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="New playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="flex-1 p-2 bg-black border border-gray-700 rounded text-sm focus:outline-none focus:border-green-500"
                />
                <button type="submit" className="bg-green-500 text-black font-bold px-4 rounded hover:bg-green-400 text-sm transition-colors">
                  Create
                </button>
              </form>

              <div className="space-y-2">
                {playlists.map((pl) => (
                  <div 
                    key={pl.id} 
                    className="p-3 bg-black rounded border border-gray-800 hover:border-green-500 cursor-pointer transition-colors group"
                    onClick={() => handlePlayPlaylist(pl)}
                  >
                    <p className="font-bold text-sm group-hover:text-green-500">{pl.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{pl.tracks.length} tracks</p>
                  </div>
                ))}
                {playlists.length === 0 && <p className="text-xs text-gray-500">No playlists yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: UPLOAD & ALL TRACKS */}
        <div className="w-full md:w-2/3">
          {/* Upload Form */}
          {user && (
            <div className="bg-[#18181b] p-6 rounded-lg mb-8 border border-gray-800">
              <h2 className="text-xl font-bold mb-4">Upload a Track</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Track Title" value={title} onChange={(e) => setTitle(e.target.value)} className="p-2 bg-black border border-gray-700 rounded focus:outline-none focus:border-green-500" required />
                  <input type="text" placeholder="Artist Name" value={artist} onChange={(e) => setArtist(e.target.value)} className="p-2 bg-black border border-gray-700 rounded focus:outline-none focus:border-green-500" required />
                </div>
                  <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-400" required />
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cover Image (Optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600" />
                </div>

                <button type="submit" disabled={isUploading} className="bg-green-500 text-black font-bold py-2 px-6 rounded hover:bg-green-400 disabled:opacity-50 transition-colors">
                  {isUploading ? 'Uploading...' : 'Upload Track'}
                </button>
              </form>
            </div>
          )}

          {/* All Tracks List */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold mb-4">All Tracks</h2>
            {tracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div key={track.id} className={`flex items-center justify-between p-4 rounded-lg transition-colors ${isCurrent ? 'bg-[#282828]' : 'hover:bg-[#18181b]'}`}>
                  
                  {/* Track Info (Click to Play) */}
                  <div 
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => isCurrent ? togglePlay() : playTrack(track)}
                  >
                    {track.coverUrl ? (
                      <img src={`${API_BASE_URL}${track.coverUrl}`} alt="cover" className="w-10 h-10 object-cover rounded shadow" />
                    ) : (
                      <div className="w-10 h-10 bg-[#282828] rounded flex items-center justify-center text-gray-500">
                        ♪
                      </div>
                    )}
                    <div>
                      <p className={`font-bold ${isCurrent ? 'text-green-500' : 'text-white'}`}>{track.title}</p>
                      <p className="text-sm text-gray-400">{track.artist}</p>
                    </div>
                  </div>
                  
                  {/* Add to Playlist Dropdown */}
                  {user && playlists.length > 0 && (
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          addTrackToPlaylist(e.target.value, track.id);
                          e.target.value = ""; // Reset dropdown
                        }
                      }}
                      className="bg-black border border-gray-700 text-xs p-1 rounded focus:outline-none focus:border-green-500 cursor-pointer"
                    >
                      <option value="">Add to playlist...</option>
                      {playlists.map((pl) => (
                        <option key={pl.id} value={pl.id}>{pl.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}