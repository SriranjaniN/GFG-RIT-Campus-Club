import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Participation, ClubEvent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Trophy, BookOpen, CheckCircle, Award, Sparkles, Ticket } from 'lucide-react';
import MembershipTicket from '../components/MembershipTicket';

export default function UserPortal() {
  const { profile, user } = useAuth();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [showTicket, setShowTicket] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const pSnap = await getDocs(query(collection(db, 'participation'), where('userId', '==', user.uid)));
        const pData = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participation));
        setParticipations(pData);

        if (pData.length > 0) {
          const eIds = pData.map(p => p.eventId);
          const eSnap = await getDocs(query(collection(db, 'events'), where('__name__', 'in', eIds.slice(0, 10))));
          setEvents(eSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClubEvent)));
        }
      } catch (err) {
        console.error("Error fetching portal data:", err);
      }
    };
    fetchData();
  }, [user]);

  const handlePhotoUpload = async (base64: string) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { photoURL: base64 });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Profile */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl shadow-xl border border-green-50 p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center text-green-600 overflow-hidden">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <User size={48} />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h3>
            <p className="text-gray-500 text-sm mb-6">{profile.email}</p>
            <div className="flex justify-center gap-4 mb-8">
              <div className="text-center">
                <div className="text-xl font-bold text-green-700">{profile.leaderboardPoints}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Points</div>
              </div>
              <div className="w-px h-10 bg-gray-100"></div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-700">{profile.badges.length}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Badges</div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowTicket(true)}
              className="w-full py-3 mb-6 bg-green-50 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-all border border-green-200"
            >
              <Ticket size={18} /> My Member Ticket
            </button>

            <div className="space-y-2">
              {profile.badges.map(badge => (
                <div key={badge} className="flex items-center gap-2 p-2 bg-green-50 rounded-xl text-xs font-bold text-green-700">
                  <Award size={14} /> {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-500" /> Leaderboard
            </h4>
            <p className="text-gray-400 text-sm mb-6">You are currently in the top 15% of coders at RIT!</p>
            <button className="w-full py-3 bg-green-600 rounded-xl font-bold hover:bg-green-700 transition-all">
              View Rankings
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Learning Progress & Participation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white rounded-3xl shadow-xl border border-green-50 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="text-green-600" /> Learning Progress
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">DSA Mastery</span>
                    <span className="text-green-600 font-bold">65%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 font-medium">Web Development</span>
                    <span className="text-green-600 font-bold">30%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-xl border border-green-50 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle className="text-green-600" /> Event Participation
              </h3>
              <div className="space-y-4">
                {events.length > 0 ? events.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm">
                        <Sparkles size={16} />
                      </div>
                      <span className="font-medium text-gray-900 text-sm line-clamp-1">{event.title}</span>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                      {participations.find(p => p.eventId === event.id)?.status}
                    </span>
                  </div>
                )) : (
                  <p className="text-gray-500 text-sm text-center py-4">No events registered yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      <AnimatePresence>
        {showTicket && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button 
                onClick={() => setShowTicket(false)}
                className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
              >
                <Sparkles size={20} className="text-gray-500" />
              </button>
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your Membership Ticket</h2>
                  <p className="text-gray-500">Customize and download your official GFG RIT Campus Club ticket.</p>
                </div>
                
                <MembershipTicket 
                  profile={profile} 
                  onPhotoUpload={handlePhotoUpload} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
