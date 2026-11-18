import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';
import Auth from './pages/Auth';
import { useAuthStore } from './store/authStore';

function Navigation() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-[#18181b] border-b border-gray-800">
      <div className="flex gap-6">
        <Link to="/" className="hover:text-green-500 font-bold">Home</Link>
        <Link to="/search" className="hover:text-green-500 font-bold">Search</Link>
        <Link to="/library" className="hover:text-green-500 font-bold">Library</Link>
      </div>
      
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Welcome, {user.name || user.email}</span>
            <button onClick={handleLogout} className="text-sm hover:text-red-500">Log out</button>
          </div>
        ) : (
          <Link to="/auth" className="bg-white text-black px-4 py-1 rounded-full font-bold hover:scale-105 transition-transform">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0e0e10] text-white">
        <Navigation />
        <main className="p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}