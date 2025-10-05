// src/components/CollegeCard.tsx
import React from 'react';
import { MapPin, Star, TrendingUp, Heart } from 'lucide-react';
import { College } from '../types';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface CollegeCardProps {
  college: College;
  onViewDetails: (college: College) => void;
}

const CollegeCard: React.FC<CollegeCardProps> = ({ college, onViewDetails }) => {
  const { user, userProfile, toggleFavorite } = useAuth();
  const isFavorited = userProfile?.favorites?.colleges?.includes(college.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to save favorites.");
      return;
    }
    toggleFavorite('colleges', college.id);
  };

  const formatCurrency = (amount: number) => {
    if (amount == null || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Government': return 'bg-emerald-100 text-emerald-800';
      case 'Private': return 'bg-saffron-100 text-saffron-800';
      case 'Deemed': return 'bg-navy-100 text-navy-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={college.image}
          alt={college.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(college.type)}`}>
            {college.type}
          </span>
          {college.nirf_ranking && (
            <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              NIRF #{college.nirf_ranking}
            </span>
          )}
        </div>
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 hover:scale-110 transition-all z-10"
          aria-label="Save to favorites"
        >
          <Heart className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-6 cursor-pointer" onClick={() => onViewDetails(college)}>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-saffron-600 transition-colors">
            {college.name}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{college.location}, {college.state}</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50 to-saffron-50 p-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Avg. Package</p>
              <p className="text-sm font-bold text-emerald-700">
                {formatCurrency(college.placements?.average_package as any)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Rating</p>
              <div className="flex items-center">
                 <Star className="h-4 w-4 text-gold-500 fill-current mr-1" />
                 <span className="text-sm font-bold text-gold-700">{college.rating ?? 'N/A'}</span>
              </div>
            </div>
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="flex">
          <button
            onClick={() => onViewDetails(college)}
            className="flex-1 bg-gradient-to-r from-saffron-500 to-gold-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-saffron-600 hover:to-gold-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;
