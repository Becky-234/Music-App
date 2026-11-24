import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { usePlayerStore } from '../store/playerStore';

// Define the Track type to satisfy TypeScript
interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string | null;
}

// Custom Hook: Delays updating a value until typing has stopped
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);
  const { playTrack, currentTrack, isPlaying, togglePlay, setQueue } = usePlayerStore();

  useEffect(() => {
    // We wrap the logic in an async function to avoid setting state directly in the effect body
    const searchTracks = async () => {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.get(`/tracks/search?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    searchTracks();
  }, [debouncedQuery]);

  // Play search results as a queue when a track is clicked
  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setQueue(results); // Set the search results as the current queue
      playTrack(track);
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      {/* Search Input */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 pl-12 bg-[#18181b] border border-gray-800 rounded-full text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
          🔍
        </span>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-gray-400 text-center py-8">Searching...</div>
      ) : results.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-xl font-bold mb-4">Top Results</h2>
          {results.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div 
                key={track.id} 
                className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${isCurrent ? 'bg-[#282828]' : 'hover:bg-[#18181b]'}`}
                onClick={() => handlePlay(track)}
              >
                {track.coverUrl ? (
                  <img src={`${API_BASE_URL}${track.coverUrl}`} alt="cover" className="w-12 h-12 object-cover rounded shadow" />
                ) : (
                  <div className="w-12 h-12 bg-[#282828] rounded flex items-center justify-center text-gray-500">
                    ♪
                  </div>
                )}
                
                <div className="flex-1">
                  <p className={`font-bold ${isCurrent ? 'text-green-500' : 'text-white'}`}>{track.title}</p>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>

                {/* Visual indicator of playing state */}
                <div className="text-gray-500 w-6 text-center">
                  {isCurrent && isPlaying ? '⏸' : '▶'}
                </div>
              </div>
            );
          })}
        </div>
      ) : debouncedQuery ? (
        <div className="text-gray-400 text-center py-12">
          <p className="text-xl mb-2">No results found for "{debouncedQuery}"</p>
          <p className="text-sm">Please make sure your spelling is correct, or try different keywords.</p>
        </div>
      ) : (
        <div className="text-gray-500 text-center py-12">
          <p className="text-xl mb-2">Start typing to search</p>
          <p className="text-sm">Search by track title or artist name.</p>
        </div>
      )}
    </div>
  );
}