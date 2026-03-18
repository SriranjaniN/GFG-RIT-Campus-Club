import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, Send, CheckCircle, HelpCircle, User, Mail } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { ClubEvent } from '../types';
import { format } from 'date-fns';

export default function FeedbackPage() {
  const { user, profile } = useAuth();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [queryText, setQueryText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'support'>('feedback');
  const [userQueries, setUserQueries] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const snap = await getDocs(collection(db, 'events'));
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClubEvent)));
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchUserQueries = async () => {
        const q = query(
          collection(db, 'support_queries'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setUserQueries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };
      fetchUserQueries();
    }
  }, [user, submitted]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEvent || rating === 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userName: profile?.name || user.email,
        eventId: selectedEvent,
        eventTitle: events.find(e => e.id === selectedEvent)?.title,
        rating,
        review,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setRating(0);
      setReview('');
      setSelectedEvent('');
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !queryText) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'support_queries'), {
        userId: user.uid,
        userName: profile?.name || user.email,
        userEmail: user.email,
        query: queryText,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setQueryText('');
    } catch (error) {
      console.error("Error submitting query:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Feedback & Support</h2>
        <p className="text-gray-600">We value your input. Help us improve the GFG RIT experience.</p>
      </div>

      <div className="flex mb-8 bg-gray-100 p-1 rounded-2xl max-w-md mx-auto">
        <button 
          onClick={() => { setActiveTab('feedback'); setSubmitted(false); }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'feedback' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
        >
          Event Feedback
        </button>
        <button 
          onClick={() => { setActiveTab('support'); setSubmitted(false); }}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'support' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
        >
          Query Support
        </button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-green-50 p-8 md:p-12"
      >
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-8">Your {activeTab === 'feedback' ? 'feedback' : 'query'} has been submitted successfully.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
            >
              Submit Another
            </button>
          </div>
        ) : activeTab === 'feedback' ? (
          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-green-100 text-green-700 rounded-2xl">
                <Star size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Event Participation Feedback</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                <select 
                  required
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose an event you attended</option>
                  {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`p-2 transition-all ${rating >= s ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-200'}`}
                    >
                      <Star size={32} fill={rating >= s ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea 
                  required
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Tell us what you liked or what we can improve..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 h-40 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
              {!user && <p className="text-center text-sm text-red-500">Please login to submit feedback.</p>}
            </div>
          </form>
        ) : (
          <form onSubmit={handleSupportSubmit} className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-green-100 text-green-700 rounded-2xl">
                <HelpCircle size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Query Support System</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                  <User className="text-gray-400" size={20} />
                  <div className="text-sm">
                    <div className="text-gray-400">Name</div>
                    <div className="font-bold text-gray-900">{profile?.name || 'Guest'}</div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                  <Mail className="text-gray-400" size={20} />
                  <div className="text-sm">
                    <div className="text-gray-400">Email</div>
                    <div className="font-bold text-gray-900">{user?.email || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Query</label>
                <textarea 
                  required
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 h-48 resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={18} />
                {isSubmitting ? "Sending..." : "Send Query"}
              </button>
              {!user && <p className="text-center text-sm text-red-500">Please login to submit a query.</p>}
            </div>

            {userQueries.length > 0 && (
              <div className="mt-16 pt-12 border-t border-gray-100">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={20} /> Your Query History
                </h4>
                <div className="space-y-4">
                  {userQueries.map((q) => (
                    <div key={q.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${q.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {q.status}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {q.createdAt?.toDate ? format(q.createdAt.toDate(), 'MMM d, yyyy') : ''}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-4">{q.query}</p>
                      {q.adminReply && (
                        <div className="bg-white p-4 rounded-xl border border-green-100">
                          <div className="text-[10px] font-bold text-green-600 uppercase mb-1">Admin Reply</div>
                          <p className="text-gray-600 text-sm italic">{q.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
}
