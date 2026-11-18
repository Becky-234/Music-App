import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Home() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(res.data.message))
      .catch(() => setStatus('Failed to connect to backend ❌'));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-green-500">Home</h1>
      <p className="text-gray-400 mt-2">Your music lives here.</p>
      
      <div className="mt-6 p-4 bg-gray-800 rounded">
        <h2 className="text-xl">Backend Status:</h2>
        <p className="text-green-400 font-mono mt-1">{status}</p>
      </div>
    </div>
  );
}