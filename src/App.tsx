// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import AuthProvider from './components/auth/AuthProvider';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CollegeSearch from './components/CollegeSearch';
import AccommodationSearch from './components/AccommodationSearch';
import AboutPage from './components/AboutPage';
import CollegeComparisonPage from './components/CollegeComparisonPage';
import Chatbot from './components/Chatbot';
import { getColleges, getPgs } from './config/firebase';
import { College, PG } from './types';
import { Loader2 } from 'lucide-react';
import FavoritesPage from './components/FavoritesPage';
import CollegeDetailsWrapper from './components/CollegeDetailsWrapper';
import PGDetails from './components/PGDetails';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // initial app data
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [allPgs, setAllPgs] = useState<PG[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // fetch initial data once
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [collegesData, pgsData] = await Promise.all([getColleges(), getPgs()]);
        if (!mounted) return;
        setAllColleges(collegesData);
        setAllPgs(pgsData);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // Map pathname to activeTab string so Header receives same API as before
  const pathname = location.pathname;
  const getActiveTabFromPath = (path: string) => {
    if (path.startsWith('/colleges')) return 'colleges';
    if (path.startsWith('/accommodations')) return 'accommodations';
    if (path.startsWith('/compare')) return 'compare';
    if (path.startsWith('/about')) return 'about';
    if (path.startsWith('/favorites')) return 'favorites';
    return 'home';
  };
  const activeTab = getActiveTabFromPath(pathname);

  // Header expects setActiveTab(tabName) — here we navigate to the appropriate route
  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'home': navigate('/'); break;
      case 'colleges': navigate('/colleges'); break;
      case 'accommodations': navigate('/accommodations'); break;
      case 'compare': navigate('/compare'); break;
      case 'about': navigate('/about'); break;
      case 'favorites': navigate('/favorites'); break;
      default: navigate('/'); break;
    }
  };

  // Small loader placeholder for initial load
  if (isLoading && pathname === '/') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 text-saffron-600 animate-spin" />
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header activeTab={activeTab} setActiveTab={handleTabChange} />

        <main>
          <Routes>
            <Route path="/" element={<HomePage setActiveTab={handleTabChange} />} />
            <Route path="/colleges" element={<CollegeSearch />} />
            <Route path="/accommodations" element={<AccommodationSearch />} />
            <Route path="/compare" element={<CollegeComparisonPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/favorites" element={<FavoritesPage allColleges={allColleges} allPgs={allPgs} onCollegeSelect={(c) => navigate(`/college/${c.id}`)} onPgSelect={(pg) => navigate(`/pg/${pg.id}`)} onCompare={() => navigate('/compare')} />} />

            {/* Details routes use wrappers so deep links work */}
            <Route path="/college/:id" element={<CollegeDetailsWrapper />} />
            <Route path="/pg/:id" element={<PGDetails />} />

            {/* Fallback to home */}
            <Route path="*" element={<HomePage setActiveTab={handleTabChange} />} />
          </Routes>
        </main>

        {/* Chatbot shown when initial load done */}
        {!isLoading && <Chatbot colleges={allColleges} pgs={allPgs} />}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#fff', color: '#333' },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
