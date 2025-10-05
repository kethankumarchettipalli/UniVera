// src/components/CollegeSearch.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, BookOpen, Plus, Loader2 } from 'lucide-react';
import { getColleges } from '../config/firebase';
import { College, SearchFilters } from '../types';
import CollegeCard from './CollegeCard';
import CollegeDetails from './CollegeDetails';
import { useAuth } from '../hooks/useAuth';
import AddCollegeForm from './admin/AddCollegeForm';
import { useNavigate } from 'react-router-dom';

const CollegeSearch: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [compareList, setCompareList] = useState<College[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'fees' | 'ranking'>('rating');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchColleges = async () => {
    setIsLoading(true);
    try {
      const collegesFromDb = await getColleges();
      setAllColleges(collegesFromDb);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const locations = useMemo(() => Array.from(new Set(allColleges.map(c => c.state))), [allColleges]);
  const branches = useMemo(() => Array.from(new Set(allColleges.flatMap(c => c.branches.map(b => b.category)))), [allColleges]);

  const filteredColleges = useMemo(() => {
    let filtered = allColleges.filter(college => {
      const matchesSearch = !searchQuery || 
        (college.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (college.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (college.branches || []).some(branch => (branch.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLocation = !filters.location || college.state === filters.location;
      const matchesBranch = !filters.branch || (college.branches || []).some(b => b.category === filters.branch);
      const matchesType = !filters.college_type || college.type === filters.college_type;
      const matchesRating = !filters.rating_min || (college.rating || 0) >= filters.rating_min;
      
      let matchesFees = true;
      if (filters.fee_range && college.branches && college.branches.length > 0) {
        // derive minimum annual fee across branches that have numeric fees
        const branchFees = college.branches
          .map(b => b?.fees?.annual)
          .filter(f => typeof f === 'number' && !isNaN(f));
        if (branchFees.length > 0) {
          const minFee = Math.min(...branchFees);
          matchesFees = minFee >= filters.fee_range.min && minFee <= filters.fee_range.max;
        } else {
          // no numeric fee info -> treat as not matching if a fee_range is specified
          matchesFees = false;
        }
      }

      return matchesSearch && matchesLocation && matchesBranch && matchesType && matchesRating && matchesFees;
    });

    // Defensive comparator for sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating': {
          const aRating = typeof a.rating === 'number' ? a.rating : 0;
          const bRating = typeof b.rating === 'number' ? b.rating : 0;
          return bRating - aRating; // descending
        }

        case 'fees': {
          const safeMinFee = (college: College): number => {
            if (!college.branches || college.branches.length === 0) return Infinity;
            const fees = college.branches
              .map(br => br?.fees?.annual)
              .filter((fee): fee is number => typeof fee === 'number' && !isNaN(fee));
            return fees.length > 0 ? Math.min(...fees) : Infinity;
          };

          const aMinFee = safeMinFee(a);
          const bMinFee = safeMinFee(b);

          // Colleges with no fee info (Infinity) will come after those with numeric fees
          if (aMinFee === bMinFee) return 0;
          if (!isFinite(aMinFee)) return 1;
          if (!isFinite(bMinFee)) return -1;
          return aMinFee - bMinFee; // ascending low -> high
        }

        case 'ranking': {
          const aRank = typeof a.nirf_ranking === 'number' ? a.nirf_ranking : 9999;
          const bRank = typeof b.nirf_ranking === 'number' ? b.nirf_ranking : 9999;
          return aRank - bRank; // ascending
        }

        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, filters, sortBy, allColleges]);

  // Toggle compare using functional update to avoid stale state
  const handleCompare = (college: College) => {
    setCompareList(prev => {
      const exists = prev.some(c => c.id === college.id);
      if (exists) {
        return prev.filter(c => c.id !== college.id);
      }
      if (prev.length >= 3) {
        // optionally show toast/info here
        return prev;
      }
      return [...prev, college];
    });
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchColleges();
  };

  // Navigate to compare page with selected IDs
  const handleCompareNow = () => {
    if (compareList.length < 2) return;
    const ids = compareList.map(c => c.id);
    navigate('/compare', { state: { preselectCollegeIds: ids } });
  };

  if (selectedCollege) {
    return <CollegeDetails college={selectedCollege} onBack={() => setSelectedCollege(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {showAddModal && <AddCollegeForm onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4">
            Find Your <span className="text-saffron-600">Perfect College</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the best educational institutions across India with detailed information and smart filters
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search colleges, courses, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-6 py-3 border-2 border-saffron-500 text-saffron-600 rounded-xl hover:bg-saffron-500 hover:text-white transition-all duration-200"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'fees' | 'ranking')}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-saffron-500 focus:outline-none"
            >
              <option value="rating">Sort by Rating</option>
              <option value="fees">Sort by Fees (Low to High)</option>
              <option value="ranking">Sort by Ranking (Low to High)</option>
            </select>
            {userProfile?.role === 'admin' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                <span>Add College</span>
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 animate-slide-up">
               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filters (you can keep your existing filter UI here) */}
               </div>
            </div>
          )}
        </div>

        {/* Compare bar (appears when user has selected at least 1) */}
        {compareList.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 mb-6">
            <div className="bg-white rounded-xl shadow p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                {compareList.map(c => (
                  <div key={c.id} className="flex items-center gap-2 bg-saffron-50 px-3 py-2 rounded-md">
                    <div className="text-sm font-medium">{c.name}</div>
                    <button
                      onClick={() => setCompareList(prev => prev.filter(p => p.id !== c.id))}
                      className="ml-2 text-xs text-gray-500 px-2 py-1 rounded bg-white"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">{compareList.length} selected</div>
                <button
                  onClick={() => setCompareList([])}
                  className="px-3 py-2 bg-gray-100 rounded"
                >
                  Clear
                </button>
                <button
                  onClick={handleCompareNow}
                  disabled={compareList.length < 2}
                  className={`px-4 py-2 rounded font-semibold ${compareList.length >= 2 ? 'bg-saffron-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  Compare Now
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6 px-4">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-saffron-600">{filteredColleges.length}</span> colleges
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 text-saffron-600 mx-auto animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">Loading Colleges...</h3>
          </div>
        ) : filteredColleges.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredColleges.map(college => (
              <CollegeCard
                key={college.id}
                college={college}
                onViewDetails={setSelectedCollege}
                onCompare={handleCompare}
                isCompared={compareList.some(c => c.id === college.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No colleges found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeSearch;
