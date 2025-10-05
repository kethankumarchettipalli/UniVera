import React from 'react';
import { Users, Target, Award, Heart, Mail, Phone, MapPin } from 'lucide-react';

const AboutPage: React.FC = () => {
   const team = [
    {
      name: 'Kethan Kumar',
      role: 'Full-Stack Developer',
      image: 'https://img.freepik.com/premium-vector/professional-vector-illustration-cartoon-man-icon_1322553-54235.jpg',
      description:
        'Former education consultant with 15+ years of experience helping students find their perfect educational path.',
    },
    {
      name: 'Raj Karthikeya',
      role: 'Full-Stack Developer',
      image: 'https://img.freepik.com/premium-vector/vector-flat-icon-bearded-man-inside-circular-frame_176841-6947.jpg',
      description:
        'Expert in accommodation services and student welfare with deep understanding of student needs.',
    },
    {
      name: 'Issac Abhilash',
      role: 'UI/UX Designer',
      image: 'https://img.freepik.com/premium-vector/professional-design-background-business-vector-illustration-banner-office-card-concept-day_1013341-242058.jpg',
      description:
        'AI and machine learning specialist focused on creating intelligent education recommendation systems.',
    },
    {
      name: 'Anil Kumar',
      role: 'Debugger',
      image: 'https://static.vecteezy.com/system/resources/previews/024/183/502/non_2x/male-avatar-portrait-of-a-young-man-with-a-beard-illustration-of-male-character-in-modern-color-style-vector.jpg',
      description:
        'Dedicated to ensuring every student finds the right college and accommodation for their success.',
    },
    {
      name: 'Siddhartha',
      role: 'Debugger',
      image: 'https://img.freepik.com/premium-photo/bearded-man-illustration_665280-67047.jpg?w=996',
      description: 'Dedicated to ensuring every student finds the right college',
    },
  ];

  // 👇 Add mentor declaration here
  const mentor = {
    name: 'Ms. P. Mounika (Btech)',
    title: 'IT Engineer',
    image: 'https://img.freepik.com/premium-photo/elementary-school-teacher-digital-avatar-generative-ai_934475-9068.jpg?w=740',
    description:
      'Lecturer in Dhanekula Institute in Engineering and Technology',
  };
  const values = [
    {
      icon: Target,
      title: 'Student-First Approach',
      description: 'Every decision we make is centered around what\'s best for students and their educational journey.'
    },
    {
      icon: Heart,
      title: 'Transparency',
      description: 'We provide honest, accurate information to help students make informed decisions about their future.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from our platform to our customer service.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a supportive community where students, parents, and educators can connect and grow together.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-6">
            About <span className="text-saffron-600">UniVera</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We're on a mission to revolutionize how students discover their perfect educational path in India. 
            From finding the right college to securing comfortable accommodation, we're here to make your 
            educational journey smooth and successful.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="bg-gradient-to-r from-saffron-500 to-gold-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To democratize access to quality education information and accommodation services across India, 
              empowering every student to make informed decisions about their academic future through 
              technology-driven solutions and personalized guidance.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become India's most trusted and comprehensive platform for educational guidance, 
              where every student can easily discover, compare, and connect with the best colleges 
              and accommodations that align with their dreams and aspirations.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Story</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 leading-relaxed mb-6">
              UniVera was born from a simple observation: finding the right college and accommodation in India 
              was unnecessarily complicated and stressful for students and their families. Our founders, 
              having experienced this challenge firsthand, decided to create a solution that would make this 
              process transparent, efficient, and student-friendly.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Starting in 2023, we began by partnering with colleges and accommodation providers across major 
              educational hubs in India. Our AI-powered platform was designed to understand each student's 
              unique needs and preferences, providing personalized recommendations that go beyond just rankings 
              and fees.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, UniVera serves thousands of students across India, helping them discover their perfect 
              educational match. We're proud to have facilitated successful college admissions and comfortable 
              accommodation arrangements for students from diverse backgrounds and aspirations.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-all duration-200">
                <div className="bg-gradient-to-br from-saffron-50 to-gold-50 p-6 rounded-2xl border border-saffron-100 hover:border-saffron-300 hover:shadow-xl transition-all duration-200 h-full">
                  <div className="bg-gradient-to-r from-saffron-500 to-gold-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-200">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
{/* Team + Guidance Sections */}
<>
  {/* Team Section */}
  <section className="mb-20">
    <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Meet Our Team</h2>

    {/* Grid: at large screens show 5 in one row */}
    <div className="mx-auto max-w-screen-xl px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {team.map((member, index) => (
          <article
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 group flex flex-col"
            aria-label={`Team member ${member.name}`}
          >
            <div className="relative h-32 sm:h-36 overflow-hidden">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-3 sm:p-4 text-center flex-1 flex flex-col">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 truncate">
                {member.name}
              </h3>
              <p className="text-saffron-600 font-medium text-xs sm:text-sm mb-2 truncate">
                {member.role}
              </p>
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-3">
                {member.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>

  {/* Guidance Section */}
  <section className="mb-16">
    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center">
      Under the esteemed guidance of
    </h2>

    {/* Mentor card - fit without cropping */}
<div className="flex justify-center">
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 group w-full max-w-md">
    <div className="w-full h-56 sm:h-64 flex items-center justify-center bg-gray-50">
      <img
        src={mentor.image}
        alt={mentor.name}
        className="max-w-full max-h-full object-contain block transition-transform duration-300 group-hover:scale-105"
      />
    </div>

    <div className="p-6 text-center">
      <h3 className="text-xl font-bold text-gray-800 mb-1">{mentor.name}</h3>
      <p className="text-saffron-600 font-semibold mb-3">{mentor.title}</p>
      <p className="text-gray-600 text-sm">{mentor.description}</p>
    </div>
  </div>
</div>

  </section>
</>


        {/* Contact Section */}
        <div className="bg-gradient-to-r from-saffron-500 to-gold-500 rounded-2xl shadow-lg p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl opacity-90">
              Have questions or need assistance? We're here to help you on your educational journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="opacity-90">+91 9876543210</p>
              <p className="opacity-90">Mon-Sat, 9 AM - 7 PM</p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="opacity-90">support@univera.com</p>
              <p className="opacity-90">We'll respond within 24 hours</p>
            </div>

            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="opacity-90">Bangalore, Karnataka</p>
              <p className="opacity-90">India</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button className="bg-white text-saffron-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg">
              Start Your Journey Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;