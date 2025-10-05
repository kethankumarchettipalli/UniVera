// src/components/CollegeDetails.tsx
import React from 'react';
import { ArrowLeft, MapPin, Star, Calendar, Building, Users, TrendingUp, Award, Wifi, Car, Shield } from 'lucide-react';
import { College } from '../types';
import QuickActions from './QuickActions'; // <-- new import (make sure file exists)

interface CollegeDetailsProps {
  college: College;
  onBack: () => void;
}

const CollegeDetails: React.FC<CollegeDetailsProps> = ({ college, onBack }) => {
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  // Defensive normalizers
  const branches = Array.isArray(college?.branches) ? college.branches : [];
  if (!Array.isArray(college?.branches) && college?.branches) {
    console.warn('college.branches expected array but got:', college.branches);
  }

  const infra = college?.infrastructure && typeof college.infrastructure === 'object' ? college.infrastructure : {
    campus_area: 'N/A',
    hostels: { capacity: 'N/A' },
    labs: 'N/A',
    sports_facilities: [],
  };

  if (!infra.sports_facilities || !Array.isArray(infra.sports_facilities)) {
    // ensure sports_facilities is always an array
    infra.sports_facilities = Array.isArray(infra.sports_facilities) ? infra.sports_facilities : [];
  }

  // Placements can be an object or array depending on how data was saved.
  // Normalize to an object with expected keys.
  const placementsRaw = college?.placements ?? null;
  let placements = {
    percentage: null as number | null,
    average_package: null as number | null,
    highest_package: null as number | null,
    top_recruiters: [] as string[],
    // if there are historical placement entries consider adding them later
  };

  if (placementsRaw) {
    if (Array.isArray(placementsRaw)) {
      // if you save placements as an array of year objects, try to pick aggregate fields if present
      // prefer top-level fields if provided elsewhere
      const first = placementsRaw[0] || {};
      placements.percentage = first.percentage ?? null;
      placements.average_package = first.average_package ?? null;
      placements.highest_package = first.highest_package ?? null;
      placements.top_recruiters = Array.isArray(first.top_recruiters) ? first.top_recruiters : [];
    } else if (typeof placementsRaw === 'object') {
      placements.percentage = placementsRaw.percentage ?? placementsRaw.placementRate ?? null;
      placements.average_package = placementsRaw.average_package ?? placementsRaw.avg_package ?? null;
      placements.highest_package = placementsRaw.highest_package ?? placementsRaw.highest ?? null;
      placements.top_recruiters = Array.isArray(placementsRaw.top_recruiters) ? placementsRaw.top_recruiters : (Array.isArray(placementsRaw.topRecruiters) ? placementsRaw.topRecruiters : []);
    } else {
      console.warn('Unexpected placements type for college:', placementsRaw);
    }
  }

  const facilities = Array.isArray(college?.facilities) ? college.facilities : (college?.facilities ? [String(college.facilities)] : []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-saffron-600 hover:text-saffron-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Search</span>
        </button>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative h-64 md:h-80">
            <img
              src={college?.image ?? '/placeholder.jpg'}
              alt={college?.name ?? 'College'}
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">{college?.name ?? 'Unnamed College'}</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-1" />
                  <span>{college?.location ?? 'Location unknown'}, {college?.state ?? ''}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-1 fill-current text-gold-400" />
                  <span>{college?.rating ?? 'N/A'}</span>
                </div>
                {college?.nirf_ranking ? (
                  <div className="bg-gold-500 px-3 py-1 rounded-full text-sm font-semibold">
                    NIRF #{college.nirf_ranking}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-saffron-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Established</p>
                  <p className="font-semibold">{college?.established ?? 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Building className="h-6 w-6 text-emerald-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold">{college?.type ?? 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Award className="h-6 w-6 text-gold-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Affiliation</p>
                  <p className="font-semibold">{college?.affiliation ?? 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Branches and Fees */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Branches & Fee Structure</h2>
              <div className="space-y-4">
                {branches.length === 0 ? (
                  <div className="text-sm text-gray-500">No branch information available.</div>
                ) : (
                  branches.map((branch: any, index: number) => {
                    if (!branch || typeof branch !== 'object') return null;
                    const branchName = branch.name ?? 'Unnamed Branch';
                    const category = branch.category ?? 'N/A';
                    const seats = branch.seats ?? 'N/A';

                    // fees may be missing or in a different shape
                    const fees = branch.fees && typeof branch.fees === 'object' ? branch.fees : {};
                    const annual = fees?.annual ?? fees?.yearly ?? fees?.perYear ?? null;
                    const total = fees?.total ?? fees?.overall ?? null;

                    return (
                      <div key={index} className="bg-gradient-to-r from-saffron-50 to-gold-50 p-4 rounded-xl border border-saffron-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">{branchName}</h3>
                            <span className="text-sm text-saffron-600 bg-saffron-100 px-2 py-1 rounded">
                              {category}
                            </span>
                          </div>
                          <div className="mt-3 md:mt-0 md:text-right">
                            <p className="text-2xl font-bold text-saffron-700">
                              {annual !== null ? formatCurrency(annual) : 'N/A'}
                              <span className="text-sm text-gray-600 font-normal">/year</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Total: {total !== null ? formatCurrency(total) : 'N/A'}
                            </p>
                            <div className="flex items-center justify-end mt-1 space-x-4">
                              <span className="text-sm text-gray-500">Seats: {seats}</span>
                              {branch.cutoff && (
                                <span className="text-sm text-emerald-600">Cutoff: {branch.cutoff}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Infrastructure */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Infrastructure</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-saffron-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Campus Area</p>
                      <p className="font-semibold">{infra.campus_area ?? 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-emerald-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Hostel Capacity</p>
                      <p className="font-semibold">{infra.hostels?.capacity ?? 'N/A'} students</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-gold-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Laboratories</p>
                      <p className="font-semibold">{infra.labs ?? 'N/A'} labs</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Sports Facilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(infra.sports_facilities) && infra.sports_facilities.length > 0 ? (
                      infra.sports_facilities.map((facility: any, index: number) => (
                        <span key={index} className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                          {facility}
                        </span>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No sports facilities listed.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Placements */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Placement Statistics</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-emerald-700 mb-1">
                    {placements.percentage ?? 'N/A'}{placements.percentage ? '%' : ''}
                  </div>
                  <p className="text-sm text-emerald-600">Placement Rate</p>
                </div>
                <div className="text-center bg-gradient-to-br from-saffron-50 to-saffron-100 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-saffron-700 mb-1">
                    {placements.average_package !== null ? formatCurrency(placements.average_package) : 'N/A'}
                  </div>
                  <p className="text-sm text-saffron-600">Average Package</p>
                </div>
                <div className="text-center bg-gradient-to-br from-gold-50 to-gold-100 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-gold-700 mb-1">
                    {placements.highest_package !== null ? formatCurrency(placements.highest_package) : 'N/A'}
                  </div>
                  <p className="text-sm text-gold-600">Highest Package</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Top Recruiters</h3>
                <div className="flex flex-wrap gap-3">
                  {Array.isArray(placements.top_recruiters) && placements.top_recruiters.length > 0 ? (
                    placements.top_recruiters.map((recruiter: any, index: number) => (
                      <span key={index} className="bg-navy-100 text-navy-800 px-3 py-2 rounded-lg font-medium">
                        {recruiter}
                      </span>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No recruiters listed.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions college={college} />

            {/* Facilities */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Facilities</h3>
              <div className="space-y-3">
                {facilities.length > 0 ? (
                  facilities.map((facility: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <Shield className="h-4 w-4 text-emerald-500 mr-3" />
                      <span className="text-gray-700">{facility}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No facilities listed.</div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-br from-saffron-500 to-gold-500 text-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="mb-4 opacity-90">
                Get in touch with our education counselors for personalized guidance.
              </p>
              <div className="space-y-2">
                <button className="w-full bg-white/20 backdrop-blur-sm text-white py-2 px-4 rounded-lg hover:bg-white/30 transition-all duration-200">
                  Call Now: +91 9876543210
                </button>
                <button className="w-full bg-white/20 backdrop-blur-sm text-white py-2 px-4 rounded-lg hover:bg-white/30 transition-all duration-200">
                  Chat with Expert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeDetails;
