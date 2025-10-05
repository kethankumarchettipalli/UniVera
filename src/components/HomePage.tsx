// src/components/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, Users, Award, TrendingUp, MapPin } from 'lucide-react';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setActiveTab }) => {
  const location = useLocation();

  // local selected state to immediately reflect the highlighted button
  const [selected, setSelected] = useState<'colleges' | 'accommodations'>('colleges');

  // initialize selected from current pathname (keeps highlight in sync when navigating)
  useEffect(() => {
    if (location.pathname.startsWith('/accommodations')) {
      setSelected('accommodations');
    } else {
      // default to colleges for '/', '/colleges', or anything else
      setSelected('colleges');
    }
  }, [location.pathname]);

  const stats = [
    { icon: BookOpen, label: 'Colleges Listed', value: '10,000+', color: 'text-saffron-600' },
    { icon: Home, label: 'PG/Hostels', value: '50,000+', color: 'text-emerald-600' },
    { icon: Users, label: 'Happy Students', value: '2L+', color: 'text-navy-600' },
    { icon: Award, label: 'Success Rate', value: '95%', color: 'text-gold-600' }
  ];

  const features = [
    {
      icon: MapPin,
      title: 'Smart Search',
      description: 'Find colleges and accommodations with advanced filters and AI-powered recommendations'
    },
    {
      icon: MapPin,
      title: 'Location Based',
      description: 'Discover PGs and hostels near your preferred colleges with exact distances'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Data',
      description: 'Get updated information on fees, cutoffs, placements, and availability'
    },
    {
      icon: Users,
      title: 'Community Reviews',
      description: 'Read authentic reviews from students and make informed decisions'
    }
  ];

  const testimonials = [
    {
      name: 'Lakshmi Narayana',
      college: 'Dhanekula Vijayawada',
      text: 'UniVera helped me find the perfect PG near my college. The detailed filters and reviews made my decision so easy!',
      image: 'https://dietportal.in:8443/ExamClick/images/23352-CM-064.jpg'
    },
    {
      name: 'Teja Ganesh',
      college: 'Sastra Chennai',
      text: 'Comparing colleges was never this simple. The platform provided all the information I needed in one place.',
      image: 'https://dietportal.in:8443/ExamClick/images/23352-CM-034.jpg'
    },
    {
      name: 'Viswa Matta',
      college: 'PVP Sidhartha',
      text: 'The AI chatbot answered all my queries instantly. It felt like having a personal education counselor!',
      image: 'https://dietportal.in:8443/ExamClick/images/23352-CM-061.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-saffron-500/10 to-emerald-500/10"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              <span className="bg-gradient-to-r from-saffron-600 via-gold-500 to-emerald-600 bg-clip-text text-transparent">
                Find Your Perfect
              </span>
              <br />
              <span className="text-navy-700">Educational Journey</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover the best colleges and accommodations across India with our AI-powered platform
            </p>
          </div>

          {/* Buttons area: conditional highlight using local `selected` */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-12 max-w-4xl mx-auto animate-slide-up">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Find Colleges */}
              <Link
                to="/colleges"
                onClick={() => {
                  setSelected('colleges');          // immediate visual feedback
                  setActiveTab('colleges');         // notify parent to navigate / sync
                }}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 text-center ${
                  selected === 'colleges'
                    ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BookOpen className="inline mr-2 h-5 w-5" />
                Find Colleges
              </Link>

              {/* Find PG/Hostels */}
              <Link
                to="/accommodations"
                onClick={() => {
                  setSelected('accommodations');   // immediate visual feedback
                  setActiveTab('accommodations');  // notify parent to navigate / sync
                }}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 text-center ${
                  selected === 'accommodations'
                    ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Home className="inline mr-2 h-5 w-5" />
                Find PG/Hostels
              </Link>
            </div>

            <div className="text-sm text-gray-500">
              Choose an option above to explore colleges or accommodations.
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in"
              >
                <stat.icon className={`h-8 w-8 ${stat.color} mb-3 mx-auto`} />
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4">
              Why Choose <span className="text-saffron-600">UniVera</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing how students discover their perfect educational path in India
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group hover:scale-105 transition-all duration-200 animate-fade-in"
              >
                <div className="bg-gradient-to-br from-saffron-50 to-gold-50 p-8 rounded-2xl h-full border border-saffron-100 hover:border-saffron-300 hover:shadow-xl transition-all duration-200">
                  <div className="bg-gradient-to-r from-saffron-500 to-gold-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 to-saffron-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4">
              Student <span className="text-emerald-600">Success Stories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from thousands of students who found their perfect match through UniVera
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-saffron-600 text-sm">{testimonial.college}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-saffron-600 to-gold-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who have found their perfect educational match
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/colleges"
              onClick={() => {
                setSelected('colleges');
                setActiveTab('colleges');
              }}
              className="px-8 py-4 bg-white text-saffron-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl text-center"
            >
              Explore Colleges
            </Link>

            <Link
              to="/accommodations"
              onClick={() => {
                setSelected('accommodations');
                setActiveTab('accommodations');
              }}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-saffron-600 transition-all duration-200 text-center"
            >
              Find Accommodations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
