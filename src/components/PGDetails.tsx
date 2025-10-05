import React, { useState } from 'react';
import { ArrowLeft, MapPin, Star, Phone, Mail, Users, Utensils, Wifi, Car, Shield, Home, Calendar } from 'lucide-react';
import { PG } from '../types';

interface PGDetailsProps {
  pg: PG;
  onBack: () => void;
}

const PGDetails: React.FC<PGDetailsProps> = ({ pg, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="h-5 w-5" />;
    if (lower.includes('parking') || lower.includes('car')) return <Car className="h-5 w-5" />;
    if (lower.includes('security')) return <Shield className="h-5 w-5" />;
    if (lower.includes('mess') || lower.includes('food')) return <Utensils className="h-5 w-5" />;
    return <Home className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-saffron-600 hover:text-saffron-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Search</span>
        </button>

        {/* Image Gallery */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-64 md:h-96">
            <img
              src={pg.images[currentImageIndex]}
              alt={pg.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            {/* Image Navigation */}
            {pg.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {pg.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white'  : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Overlay Info */}
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">{pg.name}</h1>
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{pg.location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-1 fill-current text-gold-400" />
                  <span>{pg.rating}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-saffron-500 px-3 py-1 rounded-full text-sm font-semibold">
                  {pg.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGenderColor(pg.gender)}`}>
                  {pg.gender}
                </span>
                {pg.available_rooms > 0 && (
                  <span className="bg-emerald-500 px-3 py-1 rounded-full text-sm font-semibold">
                    {pg.available_rooms} rooms available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pricing */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pricing Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-saffron-50 to-gold-50 p-6 rounded-xl border border-saffron-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-saffron-700">
                        {formatCurrency(pg.rent)}
                        <span className="text-lg font-normal text-gray-600">/month</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Monthly Rent</p>
                    </div>
                    <Home className="h-8 w-8 text-saffron-500" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-emerald-700">
                        {formatCurrency(pg.security_deposit)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Security Deposit</p>
                    </div>
                    <Shield className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Food Options */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Food Options</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pg.food_type.map((food, index) => (
                  <div key={index} className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                    <Utensils className="h-6 w-6 text-emerald-600 mr-3" />
                    <span className="font-semibold text-emerald-800">{food}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Amenities & Facilities</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pg.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    {getAmenityIcon(amenity)}
                    <span className="ml-3 text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distance from Colleges */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Distance from Colleges</h2>
              <div className="space-y-4">
                {pg.distance_from_colleges.map((distance, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-saffron-50 to-gold-50 rounded-xl border border-saffron-100">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-saffron-600 mr-3" />
                      <span className="font-semibold text-gray-800">{distance.college_name}</span>
                    </div>
                    <span className="text-saffron-600 font-bold">{distance.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact & Booking */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contact & Booking</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-saffron-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-800">{pg.contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-saffron-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800">{pg.contact.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-saffron-500 to-gold-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-saffron-600 hover:to-gold-600 transition-all duration-200 shadow-md hover:shadow-lg">
                  Book Now
                </button>
                <button className="w-full border-2 border-saffron-500 text-saffron-600 py-3 px-4 rounded-lg font-semibold hover:bg-saffron-500 hover:text-white transition-all duration-200">
                  Schedule Visit
                </button>
                <button className="w-full border-2 border-emerald-500 text-emerald-600 py-3 px-4 rounded-lg font-semibold hover:bg-emerald-500 hover:text-white transition-all duration-200">
                  Call Owner
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold">{pg.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Gender</span>
                  <span className="font-semibold">{pg.gender}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available Rooms</span>
                  <span className="font-semibold text-emerald-600">{pg.available_rooms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-gold-500 fill-current mr-1" />
                    <span className="font-semibold">{pg.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety & Security */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Safety & Security</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-3" />
                  <span>24/7 Security</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3" />
                  <span>CCTV Surveillance</span>
                </div>
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-3" />
                  <span>Secure Entry System</span>
                </div>
              </div>
              <p className="mt-4 text-sm opacity-90">
                Your safety is our priority. All our accommodations follow strict security protocols.
              </p>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-br from-saffron-500 to-gold-500 text-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="mb-4 opacity-90">
                Our accommodation experts are here to help you find the perfect place.
              </p>
              <button className="w-full bg-white/20 backdrop-blur-sm text-white py-2 px-4 rounded-lg hover:bg-white/30 transition-all duration-200">
                Chat with Expert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGDetails;