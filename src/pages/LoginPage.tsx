import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import { LogIn, ShieldCheck, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/portal');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Login is not enabled in Firebase Console. Please enable it or use Email/Password.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleStudentEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      if (isSignUp) {
        // For simplicity, we'll use the same form for login/signup
        // In a real app, you'd use createUserWithEmailAndPassword
        setError('Sign up is currently disabled. Please use Google Login or contact Admin.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/portal');
      }
    } catch (err: any) {
      setError('Invalid student credentials. Try Google Login.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err: any) {
      setError('Invalid admin credentials. Make sure you have created the account in Firebase Console.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-green-50 to-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-green-100"
      >
        <div className="text-center mb-8">
          <img 
            src="https://www.geeksforgeeks.org/wp-content/uploads/gfg_200X200.png" 
            alt="GFG Logo" 
            className="h-16 mx-auto mb-4"
            referrerPolicy="no-referrer"
          />
          <h2 className="text-2xl font-bold text-gray-900">Welcome to GFG RIT</h2>
          <p className="text-gray-600">Join the campus coding revolution</p>
        </div>

        <div className="flex mb-8 bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => { setIsAdminMode(false); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${!isAdminMode ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserIcon size={18} />
            Student
          </button>
          <button 
            onClick={() => { setIsAdminMode(true); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${isAdminMode ? 'bg-white shadow-sm text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <ShieldCheck size={18} />
            Admin
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 leading-relaxed">
            {error}
          </div>
        )}

        {!isAdminMode ? (
          <div className="space-y-6">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or use Email</span></div>
            </div>

            <form onSubmit={handleStudentEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="student@rit.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-all shadow-md"
              >
                Login to Portal
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="admin@gfgrit.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              Admin Login
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
