import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import ResourcesPage from './pages/ResourcesPage';
import BlogPage from './pages/BlogPage';
import AdminDashboard from './pages/AdminDashboard';
import UserPortal from './pages/UserPortal';
import ProfilePage from './pages/ProfilePage';
import FeedbackPage from './pages/FeedbackPage';
import LoginPage from './pages/LoginPage';
import Chatbot from './components/Chatbot';
import SplashScreen from './components/SplashScreen';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const BOOTSTRAP_ADMIN = "sriranjani2508@gmail.com";

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        
        unsubscribeProfile = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
            setLoading(false);
          } else {
            // Create default profile for new users
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'Geek',
              role: firebaseUser.email === BOOTSTRAP_ADMIN ? 'admin' : 'student',
              interests: [],
              leaderboardPoints: 0,
              badges: [],
              createdAt: serverTimestamp(),
            };
            await setDoc(docRef, newProfile);
            // setProfile will be updated by the next onSnapshot trigger
          }
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const isAdmin = profile?.role === 'admin' || user?.email === BOOTSTRAP_ADMIN;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>
      <Router>
        <div className="min-h-screen bg-white flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route 
                path="/admin/*" 
                element={profile?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/portal" 
                element={user ? <UserPortal /> : <Navigate to="/login" />} 
              />
              <Route path="/profile/:uid" element={<ProfilePage />} />
            </Routes>
          </main>
          <Chatbot />
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
