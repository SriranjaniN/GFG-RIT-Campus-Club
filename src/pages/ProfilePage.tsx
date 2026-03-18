import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { motion } from 'framer-motion';
import { User, Award, Trophy, Star, ExternalLink, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const { uid } = useParams<{ uid: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid) return;
      try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
        <Link to="/" className="text-green-600 font-bold flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-green-50"
        >
          {/* Cover Header */}
          <div className="h-32 bg-green-600 relative">
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
              <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-xl">
                <div className="w-full h-full rounded-[24px] bg-green-50 flex items-center justify-center overflow-hidden">
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-green-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-20 pb-12 px-8 text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-1">{profile.name}</h1>
            <p className="text-green-600 font-bold uppercase tracking-widest text-xs mb-6">
              GFG RIT {profile.role} Member
            </p>

            <div className="flex justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900">{profile.leaderboardPoints}</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Points</div>
              </div>
              <div className="w-px h-12 bg-gray-100"></div>
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900">{profile.badges.length}</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Badges</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="bg-green-50 rounded-3xl p-6 border border-green-100">
                <h3 className="text-sm font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Award size={18} /> Achievements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.length > 0 ? profile.badges.map((badge, i) => (
                    <span key={i} className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-green-700 shadow-sm border border-green-100">
                      {badge}
                    </span>
                  )) : (
                    <p className="text-xs text-green-600 italic">No badges earned yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Star size={18} className="text-yellow-500" /> Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.length > 0 ? profile.interests.map((interest, i) => (
                    <span key={i} className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-gray-600 shadow-sm border border-gray-200">
                      {interest}
                    </span>
                  )) : (
                    <p className="text-xs text-gray-400 italic">No interests listed.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-gray-100">
              <div className="flex flex-col items-center">
                <img 
                  src="https://www.geeksforgeeks.org/wp-content/uploads/gfg_200X200.png" 
                  alt="GFG Logo" 
                  className="w-12 h-12 mb-4 opacity-50 grayscale"
                  referrerPolicy="no-referrer"
                />
                <p className="text-xs text-gray-400 font-medium">Official Member of GeeksforGeeks RIT Campus Club</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
