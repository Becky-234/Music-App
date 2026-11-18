import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Library from './pages/Library';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0e0e10] text-white">
        
        {/* Simple Navigation for testing */}
        <nav className="flex gap-4 p-4 bg-[#18181b] border-b border-gray-800">
          <Link to="/" className="hover:text-green-500 font-bold">Home</Link>
          <Link to="/search" className="hover:text-green-500 font-bold">Search</Link>
          <Link to="/library" className="hover:text-green-500 font-bold">Library</Link>
        </nav>

        {/* Page Content */}
        <main className="p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}