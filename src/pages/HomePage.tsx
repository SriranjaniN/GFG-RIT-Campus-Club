import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { ClubEvent, Opportunity, BlogPost, UserProfile } from '../types';
import { motion } from 'framer-motion';
import { Calendar, Briefcase, Trophy, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../App';

export default function HomePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Events
        const eventsSnap = await getDocs(query(collection(db, 'events'), orderBy('dateTime', 'desc'), limit(3)));
        setEvents(eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClubEvent)));

        // Fetch Opportunities
        const oppsSnap = await getDocs(query(collection(db, 'opportunities'), limit(3)));
        setOpportunities(oppsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity)));

        // Fetch Blogs
        const blogsSnap = await getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(3)));
        setBlogs(blogsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));

        // Fetch Leaderboard - Only if authenticated
        if (user) {
          const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('leaderboardPoints', 'desc'), limit(5)));
          setTopUsers(usersSnap.docs.map(doc => doc.data() as UserProfile));
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24">
      {/* Hero / Welcome */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Welcome back, Geek!</h2>
          <p className="text-green-50 text-lg max-w-2xl mb-8">
            Ready to level up your coding game today? Check out the latest events and resources curated just for you.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/portal" className="bg-white text-green-700 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-all">
              Go to Dashboard
            </Link>
            <Link to="/resources" className="bg-green-500/30 backdrop-blur-md border border-green-400 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-500/40 transition-all">
              Start Learning
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10 pointer-events-none">
          <img 
            src="https://media.geeksforgeeks.org/wp-content/uploads/20210701150304/GeeksforGeeks.png" 
            alt="GFG Logo" 
            className="w-96 h-96 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-green-600" /> Upcoming Events
            </h3>
            <p className="text-gray-600">Don't miss out on these exciting opportunities to learn and compete.</p>
          </div>
          <Link to="/events" className="text-green-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.length > 0 ? events.map(event => (
            <EventCard key={event.id} event={event} />
          )) : (
            <div className="col-span-3 text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500">No upcoming events scheduled yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard Section */}
      <section>
        <div className="bg-white rounded-3xl shadow-xl border border-green-50 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Top Geeks Leaderboard
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topUsers.map((user, index) => (
              <div key={user.uid} className="flex flex-col items-center p-6 rounded-2xl bg-gray-50 hover:bg-green-50 transition-all border border-transparent hover:border-green-100">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold mb-4 ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-green-700 shadow-sm'}`}>
                  {index + 1}
                </div>
                <div className="font-bold text-gray-900 text-center mb-1">{user.name}</div>
                <div className="text-xs text-gray-500">{user.leaderboardPoints} Points</div>
                {index === 0 && <SparklesIcon className="text-yellow-500 mt-2" />}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/portal" className="inline-flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all">
              View Your Rank <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Opportunities Preview */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="text-green-600" /> Curated Opportunities
            </h3>
            <p className="text-gray-600">Internships, hackathons, and fellowships from top tech companies.</p>
          </div>
          <Link to="/resources" className="text-green-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            Explore All <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opportunities.map(opp => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </section>

      {/* Recent Blogs */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ArrowRight className="text-green-600" /> Recent Blogs
            </h3>
            <p className="text-gray-600">Insights and tutorials from our club members.</p>
          </div>
          <Link to="/blog" className="text-green-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
            Read All Blogs <ArrowRight size={18} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <Link key={blog.id} to="/blog" className="group bg-white rounded-2xl shadow-sm border border-green-50 overflow-hidden hover:shadow-xl transition-all">
              {blog.imageUrl && (
                <div className="h-40 overflow-hidden">
                  <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="p-6">
                <div className="text-[10px] font-bold text-green-600 uppercase mb-2">{blog.category}</div>
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">{blog.title}</h4>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500">By {blog.author}</span>
                  <span className="text-xs text-gray-400">{blog.createdAt?.toDate ? format(blog.createdAt.toDate(), 'MMM d') : 'Recently'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function EventCard({ event }: { event: ClubEvent }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-md border border-green-50 overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="h-48 overflow-hidden bg-gray-100 relative">
        <img 
          src={event.posterUrl || "https://picsum.photos/seed/coding/800/600"} 
          alt={event.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow-sm">
          {event.type}
        </div>
      </div>
      <div className="p-6">
        <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wider">
          {event.dateTime?.toDate ? format(event.dateTime.toDate(), 'PPP') : 'Coming Soon'}
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h4>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
        <a 
          href={event.registrationLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full text-center py-2 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all"
        >
          Register Now
        </a>
      </div>
    </motion.div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-50 hover:border-green-200 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-green-50 rounded-lg text-green-600">
          <Briefcase size={20} />
        </div>
        <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
          {opportunity.type}
        </span>
      </div>
      <h4 className="font-bold text-gray-900 mb-1">{opportunity.title}</h4>
      <p className="text-xs text-green-600 font-medium mb-3">{opportunity.domain}</p>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{opportunity.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Deadline: {opportunity.deadline?.toDate ? format(opportunity.deadline.toDate(), 'MMM d') : 'N/A'}
        </span>
        <a 
          href={opportunity.externalLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-green-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          Apply <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M3 5h4"/><path d="M21 17v4"/><path d="M19 19h4"/>
    </svg>
  );
}
