import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Opportunity, DOMAINS } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Briefcase, Search, ExternalLink, GraduationCap, Code, Globe, Shield, Sparkles, MessageSquare, Send, Trophy, Star, X } from 'lucide-react';
import { format } from 'date-fns';
import { getMentorRecommendations, verifyCertification, getAILearningPaths } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../App';
import { updateDoc, doc, increment, arrayUnion } from 'firebase/firestore';

export default function ResourcesPage() {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('All');
  
  // AI Mentor State
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [codingLevel, setCodingLevel] = useState('Beginner');
  const [careerGoals, setCareerGoals] = useState('');
  const [preferredDomain, setPreferredDomain] = useState(DOMAINS[0]);

  // AI Learning Paths State
  const [userInterests, setUserInterests] = useState('');
  const [aiLearningPaths, setAiLearningPaths] = useState<any[]>([]);
  const [isGeneratingPaths, setIsGeneratingPaths] = useState(false);

  // Certification State
  const [certFile, setCertFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleCertUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCertFile(file);
  };

  const handleVerify = async () => {
    if (!certFile || !user) return;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(certFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });

      const result = await verifyCertification(base64);
      setVerificationResult(result);

      if (result.isValid && result.pointsAwarded) {
        // Award points and badges
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          leaderboardPoints: increment(result.pointsAwarded),
          badges: arrayUnion({
            name: `${result.courseName} Achiever`,
            date: new Date().toISOString(),
            icon: '🏆'
          })
        });
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationResult({ isValid: false, reason: "Failed to read file or verify." });
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const snap = await getDocs(collection(db, 'opportunities'));
        setOpportunities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity)));
      } catch (err) {
        console.error("Error fetching opportunities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, []);

  const handleAiConsult = async () => {
    setIsAiLoading(true);
    const response = await getMentorRecommendations(codingLevel, careerGoals, preferredDomain);
    setAiResponse(response || "No response");
    setIsAiLoading(false);
  };

  const handleGenerateAiPaths = async () => {
    if (!userInterests.trim()) return;
    setIsGeneratingPaths(true);
    const paths = await getAILearningPaths(userInterests);
    setAiLearningPaths(paths);
    setIsGeneratingPaths(false);
  };

  const filteredOpps = opportunities.filter(opp => {
    const matchesDomain = activeDomain === 'All' || opp.domain === activeDomain;
    const matchesType = activeType === 'All' || opp.type === activeType;
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesType && matchesSearch;
  });

  const opportunityTypes = ['All', 'Internship', 'Hackathon', 'Competition', 'Fellowship'];

  const learningPaths = [
    { title: 'DSA Mastery', icon: <Code />, level: 'Beginner to Advanced', link: 'https://www.geeksforgeeks.org/data-structures/' },
    { title: 'Full Stack Web', icon: <Globe />, level: 'Intermediate', link: 'https://www.geeksforgeeks.org/web-development/' },
    { title: 'AI & Machine Learning', icon: <GraduationCap />, level: 'Advanced', link: 'https://www.geeksforgeeks.org/machine-learning/' },
    { title: 'Cybersecurity', icon: <Shield />, level: 'Intermediate', link: 'https://www.geeksforgeeks.org/cyber-security-tutorial/' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Learning & Opportunities Hub</h2>
        <p className="text-gray-600 text-lg">Curated resources and global opportunities to accelerate your career.</p>
      </div>

      {/* AI Mentor Section */}
      <section className="mb-24 bg-white rounded-3xl shadow-xl border border-green-50 overflow-hidden">
        <div className="bg-green-600 p-8 text-white flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles /> AI Mentor Assistant
            </h3>
            <p className="text-green-100">Get personalized career and learning advice instantly.</p>
          </div>
          <MessageSquare size={32} className="opacity-20" />
        </div>
        <div className="p-8">
          {!aiResponse ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coding Level</label>
                  <select 
                    value={codingLevel}
                    onChange={(e) => setCodingLevel(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Domain</label>
                  <select 
                    value={preferredDomain}
                    onChange={(e) => setPreferredDomain(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {DOMAINS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Goals</label>
                  <textarea 
                    value={careerGoals}
                    onChange={(e) => setCareerGoals(e.target.value)}
                    placeholder="e.g. I want to become a SDE at Google..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 h-32 resize-none"
                  />
                </div>
                <button 
                  onClick={handleAiConsult}
                  disabled={isAiLoading}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAiLoading ? "Consulting AI..." : "Get Recommendations"}
                  <Send size={18} />
                </button>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100 prose prose-green max-w-none">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
              </div>
              <button 
                onClick={() => setAiResponse(null)}
                className="text-green-600 font-bold flex items-center gap-2"
              >
                Ask something else
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Certification Verification Section */}
      <section className="mb-24 bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl shadow-2xl overflow-hidden text-white">
        <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
              <Trophy className="text-yellow-400" /> Claim Your Rewards
            </h3>
            <p className="text-green-100 text-lg mb-8">
              Completed a GeeksforGeeks course? Upload your certificate or a screenshot of completion. 
              Our AI will verify it and award you points and badges for your profile!
            </p>
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleCertUpload}
                  className="block w-full text-sm text-green-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-green-700 hover:file:bg-green-50"
                />
              </div>
              <button 
                onClick={handleVerify}
                disabled={!certFile || isVerifying}
                className="w-full py-4 bg-yellow-400 text-green-900 rounded-2xl font-bold hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isVerifying ? "AI is Verifying..." : "Verify & Claim Points"}
              </button>
            </div>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {verificationResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl p-8 text-gray-900 shadow-xl"
                >
                  {verificationResult.isValid ? (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Star size={40} fill="currentColor" />
                      </div>
                      <h4 className="text-2xl font-bold text-green-700 mb-2">Verification Successful!</h4>
                      <p className="text-gray-600 mb-6">{verificationResult.reason}</p>
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                        <div className="text-sm text-green-600 font-bold uppercase tracking-wider mb-1">Points Awarded</div>
                        <div className="text-3xl font-black text-green-700">+{verificationResult.pointsAwarded}</div>
                      </div>
                      <p className="text-sm text-gray-500 italic">Check your User Portal to see your new badge!</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <X size={40} />
                      </div>
                      <h4 className="text-2xl font-bold text-red-700 mb-2">Verification Failed</h4>
                      <p className="text-gray-600 mb-6">{verificationResult.reason}</p>
                      <button 
                        onClick={() => setVerificationResult(null)}
                        className="text-green-600 font-bold"
                      >
                        Try again with a clearer image
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-3xl h-80 flex flex-col items-center justify-center p-8 text-center">
                  <div className="p-4 bg-white/10 rounded-full mb-4">
                    <GraduationCap size={48} className="text-white/60" />
                  </div>
                  <p className="text-green-100 font-medium">Upload your GFG certificate to see the AI analysis here.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="mb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
              <BookOpen size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Learning Paths</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input 
              type="text"
              placeholder="Enter your interests (e.g. React, Python, ML)..."
              value={userInterests}
              onChange={(e) => setUserInterests(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-sm min-w-[250px]"
            />
            <button 
              onClick={handleGenerateAiPaths}
              disabled={isGeneratingPaths || !userInterests.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingPaths ? "Generating..." : "AI Recommend"}
              <Sparkles size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Static Paths */}
          {learningPaths.map((path, index) => (
            <motion.a
              key={path.title}
              href={path.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-green-50 hover:shadow-xl hover:border-green-200 transition-all flex flex-col h-full"
            >
              <div className="p-4 bg-green-50 text-green-600 rounded-2xl w-fit mb-6">
                {path.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h4>
              <p className="text-sm text-gray-500 mb-6 flex-grow">{path.level}</p>
              <div className="flex items-center text-green-600 font-bold text-sm gap-2">
                Start Learning <ExternalLink size={14} />
              </div>
            </motion.a>
          ))}

          {/* AI Recommended Paths */}
          <AnimatePresence>
            {aiLearningPaths.map((path, index) => (
              <motion.a
                key={`ai-${path.title}-${index}`}
                href={path.link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl shadow-md border border-green-200 hover:shadow-xl hover:border-green-400 transition-all flex flex-col h-full relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-2 bg-green-600 text-white rounded-bl-xl text-[10px] font-bold uppercase tracking-tighter">
                  AI Pick
                </div>
                <div className="p-4 bg-white text-green-600 rounded-2xl w-fit mb-6 shadow-sm">
                  <Sparkles size={20} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h4>
                <p className="text-xs text-green-700 font-bold mb-2 uppercase tracking-wide">{path.level}</p>
                <p className="text-sm text-gray-600 mb-6 flex-grow line-clamp-3 italic">
                  "{path.description}"
                </p>
                <div className="flex items-center text-green-700 font-bold text-sm gap-2">
                  Explore Path <ExternalLink size={14} />
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Opportunities Section */}
      <section>
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                <Briefcase size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">GFG Global Opportunities</h3>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 shadow-sm transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Domain:</span>
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveDomain('All')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeDomain === 'All' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  All
                </button>
                {DOMAINS.map(domain => (
                  <button
                    key={domain}
                    onClick={() => setActiveDomain(domain)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeDomain === domain ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {domain.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Type:</span>
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                {opportunityTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeType === type ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOpps.length > 0 ? filteredOpps.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-green-50 hover:shadow-2xl transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                  {opp.type}
                </span>
                <span className="text-xs text-gray-400">
                  {opp.deadline?.toDate ? format(opp.deadline.toDate(), 'MMM d, yyyy') : 'No Deadline'}
                </span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{opp.title}</h4>
              <p className="text-sm text-green-600 font-medium mb-4">{opp.domain}</p>
              <p className="text-gray-600 text-sm mb-8 line-clamp-3 leading-relaxed">
                {opp.description}
              </p>
              <a 
                href={opp.externalLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
              >
                View Opportunity
              </a>
            </motion.div>
          )) : (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No opportunities found for this domain yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
