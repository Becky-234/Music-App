import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

// Helper to format seconds into MM:SS
const formatTime = (time: number) => {
  if (isNaN(time) || time === 0) return '0:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function AudioPlayer() {
  const { 
    currentTrack, isPlaying, togglePlay, playNext, playPrevious,
    currentTime, duration, volume, setCurrentTime, setDuration, setVolume
  } = usePlayerStore();
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync play/pause state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => console.log("Playback error:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!currentTrack) return null;

  const API_BASE_URL = 'http://localhost:4000';

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#18181b] border-t border-gray-800 px-4 py-3 flex items-center justify-between z-50">
      
      {/* LEFT: Track Info */}
      <div className="flex items-center gap-4 w-1/4">
        {/* Replace the static div with this conditional rendering */}
        {currentTrack.coverUrl ? (
          <img src={`${API_BASE_URL}${currentTrack.coverUrl}`} alt="cover" className="w-14 h-14 object-cover rounded shadow shrink-0" />
        ) : (
          <div className="w-14 h-14 bg-gray-700 rounded flex items-center justify-center text-xl text-gray-400 shrink-0">
            ♪
          </div>
        )}
        <div className="truncate">
          <p className="text-sm font-bold truncate text-white">{currentTrack.title}</p>
          <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* CENTER: Controls & Progress */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl px-4">
        {/* Buttons */}
        <div className="flex items-center gap-6">
          <button onClick={playPrevious} className="text-gray-400 hover:text-white text-xl transition-colors">⏮</button>
          <button 
            onClick={togglePlay} 
            className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:scale-105 transition-transform"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={playNext} className="text-gray-400 hover:text-white text-xl transition-colors">⏭</button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          
          <input 
            type="range" 
            min="0" 
            max={duration || 0} 
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT: Volume Control */}
      <div className="w-1/4 flex justify-end items-center gap-2 pr-4">
        <span className="text-gray-400 text-sm">🔊</span>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
      </div>

      {/* Hidden Audio Tag with Event Listeners */}
      <audio
        ref={audioRef}
        src={`${API_BASE_URL}${currentTrack.audioUrl}`}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={playNext}
      />
    </div>
  );
}