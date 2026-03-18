import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Users, Trophy, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-20 bg-slate-50 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          x: ['-25%', '25%', '-15%', '-25%'],
          y: ['-15%', '15%', '25%', '-15%'],
          scale: [1, 1.3, 0.8, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-0 w-[120%] h-[120%] bg-green-300/30 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          x: ['25%', '-25%', '15%', '25%'],
          y: ['15%', '-15%', '-25%', '15%'],
          scale: [1.3, 0.8, 1.1, 1.3],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 right-0 w-[120%] h-[120%] bg-emerald-300/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          x: ['-15%', '15%', '0%', '-15%'],
          y: ['25%', '-25%', '15%', '25%'],
          scale: [0.8, 1.1, 1, 0.8],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 left-0 w-[120%] h-[120%] bg-teal-300/20 rounded-full blur-[120px]"
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden min-h-screen">
      <AuroraBackground />
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://www.geeksforgeeks.org/wp-content/uploads/gfg_200X200.png" 
                alt="GFG Logo" 
                className="h-24 mx-auto mb-8 drop-shadow-lg"
                referrerPolicy="no-referrer"
              />
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-6">
                <Sparkles size={16} className="mr-2" />
                Empowering the Next Generation of Geeks
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
                GeeksforGeeks <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                  Campus Club RIT
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
                The ultimate digital hub for the RIT Chennai coding community. 
                Learn, compete, and grow with the world's leading platform for geeks.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to="/home" 
                  className="px-8 py-4 bg-green-600 text-white rounded-full font-bold text-lg hover:bg-green-700 transition-all shadow-xl hover:shadow-green-200 flex items-center justify-center gap-2"
                >
                  Explore Platform <ArrowRight size={20} />
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-4 bg-white text-green-700 border-2 border-green-600 rounded-full font-bold text-lg hover:bg-green-50 transition-all flex items-center justify-center"
                >
                  Join the Club
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Campus: Rajalakshmi Institute of Technology</h2>
            
            <div className="relative max-w-4xl mx-auto mb-12">
              <img 
                id="campus-preview"
                src="https://raw.githubusercontent.com/soundarya457/RIT-Campus/main/rit-about.jpg.jpeg" 
                alt="Rajalakshmi Institute of Technology Campus" 
                className="rounded-3xl shadow-2xl w-full h-auto min-h-[400px] object-cover bg-gray-100 transition-all duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200";
                }}
              />
            </div>
            
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-600 text-lg leading-relaxed mb-12">
                The GeeksforGeeks Campus Club at Rajalakshmi Institute of Technology (RIT) is a student-led community 
                dedicated to fostering a robust coding culture on campus. We aim to bridge the gap between academic 
                learning and industry requirements by providing a platform for students to explore, learn, and excel 
                in the world of technology.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="flex items-start gap-4 p-6 bg-green-50 rounded-2xl">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600 mt-1">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Mission</h4>
                    <p className="text-gray-600 text-sm">To empower students with technical skills and problem-solving abilities through consistent practice and collaborative learning.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-6 bg-green-50 rounded-2xl">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600 mt-1">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Objectives</h4>
                    <p className="text-gray-600 text-sm">Conducting workshops, hackathons, and coding contests while providing a support system for career growth in collaboration with GeeksForGeeks.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Coordinators Section */}
      <section className="py-24 bg-gray-50/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Club Coordinators & Leads</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Meet the dedicated team working behind the scenes to make GFG RIT a success.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <CoordinatorCard 
              name="Dr. S. Rajalakshmi"
              role="Faculty Coordinator"
              image="https://picsum.photos/seed/faculty/400/400"
            />
            <CoordinatorCard 
              name="Student Lead"
              role="President"
              image="https://picsum.photos/seed/lead1/400/400"
            />
            <CoordinatorCard 
              name="Technical Head"
              role="Operations"
              image="https://picsum.photos/seed/lead2/400/400"
            />
            <CoordinatorCard 
              name="Event Manager"
              role="Outreach"
              image="https://picsum.photos/seed/lead3/400/400"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Code className="text-green-600" size={32} />}
              title="Coding Events"
              description="Participate in hackathons, workshops, and weekly contests designed to sharpen your skills."
            />
            <FeatureCard 
              icon={<BookOpen className="text-green-600" size={32} />}
              title="Curated Resources"
              description="Access hand-picked GFG articles, practice problems, and learning paths tailored for RIT students."
            />
            <FeatureCard 
              icon={<Trophy className="text-green-600" size={32} />}
              title="Global Opportunities"
              description="Stay updated with the latest internships, fellowships, and job openings from top tech giants."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">Active Members</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-green-100">Events Hosted</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-green-100">Internships Secured</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-green-100">Problems Solved</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white p-8 rounded-2xl shadow-sm border border-green-50 hover:shadow-xl transition-all"
    >
      <div className="mb-6 p-3 bg-green-50 inline-block rounded-xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

function CoordinatorCard({ name, role, image }: { name: string, role: string, image: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-green-50 text-center hover:shadow-xl transition-all"
    >
      <img 
        src={image} 
        alt={name} 
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-green-50"
        referrerPolicy="no-referrer"
      />
      <h4 className="font-bold text-gray-900">{name}</h4>
      <p className="text-green-600 text-sm font-medium">{role}</p>
    </motion.div>
  );
}
