import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Home, Plus, Loader2 } from 'lucide-react';
import { getPgs } from '../config/firebase';
import { PG, PGFilters } from '../types';
import PGCard from './PGCard';
import PGDetails from './PGDetails';
import { useAuth } from '../hooks/useAuth';
import AddPgForm from './admin/AddPgForm';

const AccommodationSearch: React.FC = () => {
  const { userProfile } = useAuth();
  const [allPgs, setAllPgs] = useState<PG[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PGFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPG, setSelectedPG] = useState<PG | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'rent'>('rating');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchPgs = async () => {
    setIsLoading(true);
    try {
      const pgsFromDb = await getPgs();
      setAllPgs(pgsFromDb);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPgs();
  }, []);

  const locations = useMemo(() => Array.from(new Set(allPgs.map(pg => pg.location.split(',')[1]?.trim() || pg.location))), [allPgs]);
  const foodTypes = useMemo(() => Array.from(new Set(allPgs.flatMap(pg => pg.food_type))), [allPgs]);

  const filteredPGs = useMemo(() => {
    let filtered = allPgs.filter(pg => {
      const matchesSearch = !searchQuery || 
        pg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pg.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'rent': return a.rent - b.rent;
        default: return 0;
      }
    });
    return filtered;
  }, [searchQuery, filters, sortBy, allPgs]);
  
  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchPgs();
  };

  if (selectedPG) {
    return <PGDetails pg={selectedPG} onBack={() => setSelectedPG(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {showAddModal && <AddPgForm onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4">
            Find Your <span className="text-saffron-600">Perfect Accommodation</span>
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search PGs, hostels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'rent')}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none"
            >
              <option value="rating">Sort by Rating</option>
              <option value="rent">Sort by Rent</option>
            </select>
             {userProfile?.role === 'admin' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                <Plus className="h-5 w-5" />
                <span>Add PG</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-saffron-600">{filteredPGs.length}</span> accommodations
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 text-saffron-600 mx-auto animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">Loading...</h3>
          </div>
        ) : filteredPGs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPGs.map(pg => (
              <PGCard
                key={pg.id}
                pg={pg}
                onViewDetails={setSelectedPG}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No accommodations found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccommodationSearch;