import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';

interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string | null;
}

export default function Library() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const { playTrack, setQueue, currentTrack, isPlaying, togglePlay } = usePlayerStore();

  // Fetch tracks on load
  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await api.get('/tracks');
      setTracks(res.data);
      setQueue(res.data); // Sync with player queue
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', title);
    formData.append('artist', artist);
    
    try {
      await api.post('/tracks/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Reset form
      setFile(null);
      setTitle('');
      setArtist('');
      // Refresh list
      fetchTracks();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold text-green-500 mb-6">Your Library</h1>

      {/* Upload Form (Only show if logged in) */}
      {user && (
        <div className="bg-[#18181b] p-6 rounded-lg mb-8 border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Upload a Track</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Track Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-2 bg-black border border-gray-700 rounded"
                required
              />
              <input
                type="text"
                placeholder="Artist Name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="p-2 bg-black border border-gray-700 rounded"
                required
              />
            </div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-black hover:file:bg-green-400"
              required
            />
            <button
              type="submit"
              disabled={isUploading}
              className="bg-green-500 text-black font-bold py-2 px-6 rounded hover:bg-green-400 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload Track'}
            </button>
          </form>
        </div>
      )}

      {/* Track List */}
      <div className="space-y-2">
        {tracks.map((track) => {
          const isCurrent = currentTrack?.id === track.id;
          return (
            <div 
              key={track.id} 
              className={`flex items-center justify-between p-4 rounded-lg transition-colors cursor-pointer group ${isCurrent ? 'bg-[#282828]' : 'hover:bg-[#18181b]'}`}
              onClick={() => {
                if (isCurrent) {
                  togglePlay(); // toggle play/pause if clicked same track
                } else {
                  playTrack(track); // play new track
                }
              }}
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-500 w-6 text-center">
                  {isCurrent && isPlaying ? '⏸' : '▶'}
                </span>
                <div>
                  <p className={`font-bold ${isCurrent ? 'text-green-500' : 'text-white'}`}>{track.title}</p>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>
              </div>
            </div>
          );
        })}
        {tracks.length === 0 && (
          <p className="text-gray-500 text-center py-8">No tracks yet. Upload one above!</p>
        )}
      </div>
    </div>
  );
}