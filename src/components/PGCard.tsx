import React from 'react';
import { MapPin, Star, Heart, Users } from 'lucide-react';
import { PG } from '../types';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface PGCardProps {
  pg: PG;
  onViewDetails: (pg: PG) => void;
}

const PGCard: React.FC<PGCardProps> = ({ pg, onViewDetails }) => {
  const { user, userProfile, toggleFavorite } = useAuth();
  const isFavorited = userProfile?.favorites?.pgs?.includes(pg.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to save favorites.");
      return;
    }
    toggleFavorite('pgs', pg.id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'Boys': return 'bg-blue-100 text-blue-800';
      case 'Girls': return 'bg-pink-100 text-pink-800';
      case 'Co-ed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={pg.images[0]}
          alt={pg.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 hover:scale-110 transition-all z-10"
          aria-label="Save to favorites"
        >
          <Heart className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : ''}`} />
        </button>
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getGenderColor(pg.gender)}`}>
            {pg.gender}
          </span>
        </div>
      </div>

      <div className="p-6 cursor-pointer" onClick={() => onViewDetails(pg)}>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-saffron-600 transition-colors line-clamp-1">
            {pg.name}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm line-clamp-1">{pg.location}</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-saffron-50 to-gold-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-saffron-700">
                {formatCurrency(pg.rent)}
                <span className="text-sm font-normal text-gray-600">/month</span>
              </p>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-gold-500 fill-current mr-1" />
              <span className="text-sm font-semibold">{pg.rating}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => onViewDetails(pg)}
            className="flex-1 bg-gradient-to-r from-saffron-500 to-gold-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-saffron-600 hover:to-gold-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PGCard;