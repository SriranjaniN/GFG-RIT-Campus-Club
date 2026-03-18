import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { ClubEvent, Opportunity, BlogPost, UserProfile } from '../types';
import { motion } from 'framer-motion';
import { Calendar, Briefcase, FileText, BarChart3, Plus, Trash2, Edit, Save, X, MessageSquare, HelpCircle, Star } from 'lucide-react';
import { format } from 'date-fns';

import { useAuth } from '../App';

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('events');
  const [testEmail, setTestEmail] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [supportQueries, setSupportQueries] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, events: 0, participations: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [regLoading, setRegLoading] = useState(false);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const eSnap = await getDocs(query(collection(db, 'events'), orderBy('dateTime', 'desc')));
      const eventsData = eSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClubEvent));
      
      // Fetch registration counts for each event
      const pSnap = await getDocs(collection(db, 'participation'));
      const participations = pSnap.docs.map(doc => doc.data());
      
      const eventsWithCounts = eventsData.map(event => ({
        ...event,
        registeredCount: participations.filter(p => p.eventId === event.id).length
      }));
      
      setEvents(eventsWithCounts);

      const oSnap = await getDocs(collection(db, 'opportunities'));
      setOpportunities(oSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Opportunity)));

      const bSnap = await getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc')));
      setBlogs(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));

      const fSnap = await getDocs(query(collection(db, 'feedback'), orderBy('createdAt', 'desc')));
      setFeedback(fSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const sSnap = await getDocs(query(collection(db, 'support_queries'), orderBy('createdAt', 'desc')));
      setSupportQueries(sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const uSnap = await getDocs(collection(db, 'users'));
      setStats({
        users: uSnap.size,
        events: eSnap.size,
        participations: pSnap.size
      });
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const collectionName = activeTab;
      const data = { ...formData };
      
      if (activeTab === 'events') {
        if (!data.dateTime) {
          alert("Please select a date and time.");
          return;
        }
        const date = new Date(data.dateTime);
        if (isNaN(date.getTime())) {
          alert("Invalid date format. Please try again.");
          return;
        }
        data.dateTime = date;
        data.maxSlots = parseInt(data.maxSlots) || 0;
        if (data.isTeamEvent) {
          data.minTeamSize = parseInt(data.minTeamSize) || 1;
          data.maxTeamSize = parseInt(data.maxTeamSize) || 1;
        }
      } else if (activeTab === 'blogs') {
        data.createdAt = serverTimestamp();
        if (!isEditing) {
          data.author = profile?.name || 'Admin';
          data.authorId = user?.uid || 'admin';
          data.likes = [];
        }
      } else if (activeTab === 'opportunities' && data.deadline) {
        data.deadline = new Date(data.deadline);
      }

      if (isEditing) {
        await updateDoc(doc(db, collectionName, isEditing), data);
        setIsEditing(null);
      } else {
        await addDoc(collection(db, collectionName), data);
      }
      
      setIsAdding(false);
      setFormData({});
      fetchData();
    } catch (err) {
      alert("Error saving document: " + err);
    }
  };

  const handleEdit = (item: any) => {
    const data = { ...item };
    if (activeTab === 'events' && data.dateTime?.toDate) {
      data.dateTime = format(data.dateTime.toDate(), "yyyy-MM-dd'T'HH:mm");
    } else if (activeTab === 'opportunities' && data.deadline?.toDate) {
      data.deadline = format(data.deadline.toDate(), "yyyy-MM-dd");
    }
    setFormData(data);
    setIsEditing(item.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this? This action cannot be undone.")) return;
    try {
      const collectionName = activeTab;
      console.log(`Deleting from ${collectionName} with ID: ${id}`);
      await deleteDoc(doc(db, collectionName, id));
      
      // Cascade delete for events
      if (collectionName === 'events') {
        console.log("Starting cascade delete for event:", id);
        // Delete participations
        const pSnap = await getDocs(query(collection(db, 'participation'), where('eventId', '==', id)));
        console.log(`Found ${pSnap.size} participations to delete`);
        for (const pDoc of pSnap.docs) {
          await deleteDoc(pDoc.ref);
        }
        
        // Delete teams
        const tSnap = await getDocs(query(collection(db, 'teams'), where('eventId', '==', id)));
        console.log(`Found ${tSnap.size} teams to delete`);
        for (const tDoc of tSnap.docs) {
          await deleteDoc(tDoc.ref);
        }
        
        setSelectedEventId(null);
      }
      
      alert("Deleted successfully.");
      await fetchData();
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Error deleting: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleReply = async (queryId: string, reply: string) => {
    try {
      await updateDoc(doc(db, 'support_queries', queryId), {
        adminReply: reply,
        status: 'resolved',
        resolvedAt: serverTimestamp()
      });
      fetchData();
    } catch (err) {
      alert("Error replying: " + err);
    }
  };

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestLoading(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });
      const data = await response.json();
      if (response.ok) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error + (data.details ? ': ' + data.details : '') });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    setRegLoading(true);
    setSelectedEventId(eventId);
    try {
      const q = query(
        collection(db, 'participation'), 
        where('eventId', '==', eventId)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by timestamp (registration date)
      data.sort((a: any, b: any) => {
        const dateA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const dateB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return dateB - dateA; // Newest first
      });
      setRegistrations(data);
    } catch (err) {
      console.error("Error fetching registrations:", err);
    } finally {
      setRegLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Control Panel</h2>
          <p className="text-gray-600">Manage your club's digital presence.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto">
          <TabButton active={activeTab === 'events'} onClick={() => { setActiveTab('events'); setSelectedEventId(null); }} icon={<Calendar size={18} />} label="Events" />
          <TabButton active={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} icon={<Briefcase size={18} />} label="Opportunities" />
          <TabButton active={activeTab === 'blogs'} onClick={() => setActiveTab('blogs')} icon={<FileText size={18} />} label="Blogs" />
          <TabButton active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} icon={<MessageSquare size={18} />} label="Feedback" />
          <TabButton active={activeTab === 'support_queries'} onClick={() => setActiveTab('support_queries')} icon={<HelpCircle size={18} />} label="Queries" />
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={18} />} label="Stats" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Save size={18} />} label="Settings" />
        </div>
      </div>

      {activeTab !== 'stats' && activeTab !== 'feedback' && activeTab !== 'support_queries' && (
        <div className="mb-8">
          {!isAdding ? (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
            >
              <Plus size={20} /> Add New {activeTab === 'opportunities' ? 'Opportunity' : activeTab.slice(0, -1)}
            </button>
          ) : (
            <motion.form 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAdd}
              className="bg-white p-8 rounded-3xl shadow-xl border border-green-100 space-y-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">New {activeTab === 'opportunities' ? 'Opportunity' : activeTab.slice(0, -1)}</h3>
                <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTab === 'events' && (
                  <>
                    <Input label="Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} required />
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select 
                        value={formData.type || ''} 
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-medium"
                      >
                        <option value="">Select Type</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Hackathon">Hackathon</option>
                        <option value="Contest">Contest</option>
                      </select>
                    </div>
                    <Input label="Date & Time" type="datetime-local" value={formData.dateTime} onChange={v => setFormData({...formData, dateTime: v})} required />
                    <Input label="Registration Link" value={formData.registrationLink} onChange={v => setFormData({...formData, registrationLink: v})} />
                    <Input label="Max Slots" type="number" value={formData.maxSlots} onChange={v => setFormData({...formData, maxSlots: v})} />
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <input 
                        type="checkbox" 
                        id="isTeamEvent"
                        checked={formData.isTeamEvent || false}
                        onChange={e => setFormData({...formData, isTeamEvent: e.target.checked})}
                        className="w-5 h-5 accent-green-600"
                      />
                      <label htmlFor="isTeamEvent" className="text-sm font-bold text-gray-700">Team Event</label>
                    </div>
                    {formData.isTeamEvent && (
                      <>
                        <Input label="Min Team Size" type="number" value={formData.minTeamSize} onChange={v => setFormData({...formData, minTeamSize: v})} />
                        <Input label="Max Team Size" type="number" value={formData.maxTeamSize} onChange={v => setFormData({...formData, maxTeamSize: v})} />
                      </>
                    )}
                    <Input label="Poster URL" value={formData.posterUrl} onChange={v => setFormData({...formData, posterUrl: v})} />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                    </div>
                  </>
                )}
                {activeTab === 'opportunities' && (
                  <>
                    <Input label="Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
                    <Input label="Type" value={formData.type} onChange={v => setFormData({...formData, type: v})} placeholder="Internship/Hackathon..." />
                    <Input label="Domain" value={formData.domain} onChange={v => setFormData({...formData, domain: v})} />
                    <Input label="Deadline" type="date" value={formData.deadline} onChange={v => setFormData({...formData, deadline: v})} />
                    <Input label="External Link" value={formData.externalLink} onChange={v => setFormData({...formData, externalLink: v})} />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </>
                )}
                {activeTab === 'blogs' && (
                  <>
                    <Input label="Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} />
                    <Input label="Author" value={formData.author} onChange={v => setFormData({...formData, author: v})} />
                    <Input label="Category" value={formData.category} onChange={v => setFormData({...formData, category: v})} />
                    <Input label="Image URL" value={formData.imageUrl} onChange={v => setFormData({...formData, imageUrl: v})} />
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
                      <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" rows={6} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                    </div>
                  </>
                )}
              </div>
              <button type="submit" className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-all">
                Save {activeTab === 'opportunities' ? 'Opportunity' : activeTab.slice(0, -1)}
              </button>
            </motion.form>
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-green-50 overflow-hidden">
        {activeTab === 'events' && (
          selectedEventId ? (
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <button 
                    onClick={() => setSelectedEventId(null)}
                    className="text-green-600 font-bold flex items-center gap-2 mb-2 hover:underline"
                  >
                    ← Back to Events
                  </button>
                  <h3 className="text-2xl font-black text-gray-900">
                    Registrations: {events.find(e => e.id === selectedEventId)?.title}
                  </h3>
                </div>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => handleDelete(selectedEventId)}
                    className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                  >
                    <Trash2 size={18} /> Delete Event
                  </button>
                  <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    {registrations.length} Total Registrations
                  </div>
                </div>
              </div>

              {regLoading ? (
                <div className="py-12 text-center text-gray-500 font-medium">Loading registrations...</div>
              ) : registrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-900">Name</th>
                        <th className="px-6 py-4 font-bold text-gray-900">Email</th>
                        <th className="px-6 py-4 font-bold text-gray-900">Dept/Year</th>
                        <th className="px-6 py-4 font-bold text-gray-900">Team Name</th>
                        <th className="px-6 py-4 font-bold text-gray-900">Team Lead</th>
                        <th className="px-6 py-4 font-bold text-gray-900">Members</th>
                        <th className="px-6 py-4 font-bold text-gray-900">Status</th>
                        <th className="px-6 py-4 font-bold text-gray-900">Reg. Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {registrations.map((reg) => {
                        const teamMembers = reg.teamId 
                          ? registrations.filter(r => r.teamId === reg.teamId && r.teamRole === 'member').map(r => r.userName).join(', ')
                          : 'N/A';
                        const teamLead = reg.teamId
                          ? registrations.find(r => r.teamId === reg.teamId && r.teamRole === 'leader')?.userName || 'N/A'
                          : 'N/A';

                        return (
                          <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{reg.userName}</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">{reg.userEmail}</td>
                            <td className="px-6 py-4 text-gray-500 text-sm">{reg.department} / {reg.year}</td>
                            <td className="px-6 py-4 text-gray-900 font-bold">{reg.teamName || 'Individual'}</td>
                            <td className="px-6 py-4 text-gray-600 text-sm">{teamLead}</td>
                            <td className="px-6 py-4 text-gray-500 text-xs max-w-[200px] truncate" title={teamMembers}>
                              {teamMembers}
                            </td>
                            <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              reg.status === 'registered' ? 'bg-green-100 text-green-700' : 
                              reg.status === 'pending_approval' ? 'bg-orange-100 text-orange-700' : 
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {reg.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {reg.timestamp?.toDate ? format(reg.timestamp.toDate(), 'MMM d, p') : 'N/A'}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500 font-medium italic">No registrations yet for this event.</div>
              )}
            </div>
          ) : (
            <List items={events} onDelete={handleDelete} onEdit={handleEdit} onViewRegistrations={fetchRegistrations} activeTab={activeTab} />
          )
        )}
        {activeTab === 'opportunities' && <List items={opportunities} onDelete={handleDelete} onEdit={handleEdit} activeTab={activeTab} />}
        {activeTab === 'blogs' && <List items={blogs} onDelete={handleDelete} onEdit={handleEdit} activeTab={activeTab} />}
        {activeTab === 'feedback' && <FeedbackList items={feedback} onDelete={handleDelete} />}
        {activeTab === 'support_queries' && <QueryList items={supportQueries} onDelete={handleDelete} onReply={handleReply} />}
        {activeTab === 'stats' && (
          <div className="p-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <StatCard label="Total Users" value={stats.users} />
            <StatCard label="Total Events" value={stats.events} />
            <StatCard label="Participations" value={stats.participations} />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="p-12 max-w-2xl mx-auto">
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Email Settings</h3>
                  <p className="text-gray-500 text-sm font-medium">Verify your SMTP configuration</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Configuration Status</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    SMTP settings are managed via environment variables in the AI Studio Secrets panel.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-gray-400 uppercase">SMTP Provider</span>
                      <span className="font-black text-gray-900">Configured via Secrets</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleTestEmail} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Test Recipient Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="your-email@example.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-sm"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={testLoading}
                    className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {testLoading ? 'Sending...' : 'Send Test Email'}
                  </button>
                </form>

                {testResult && (
                  <div className={`p-4 rounded-2xl border ${testResult.success ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'} text-sm font-bold`}>
                    {testResult.message}
                    {!testResult.success && testResult.message.includes('Authentication Failed') && (
                      <div className="mt-2 text-xs font-medium opacity-80">
                        Tip: If using Gmail, ensure you have enabled 2-Step Verification and generated an "App Password". Regular account passwords will be rejected.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${active ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {icon} {label}
    </button>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, required = false }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input 
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}

function List({ items, onDelete, onEdit, onViewRegistrations, activeTab }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-8 py-4 font-bold text-gray-900">Title / Name</th>
            <th className="px-8 py-4 font-bold text-gray-900">Details</th>
            {activeTab === 'events' && <th className="px-8 py-4 font-bold text-gray-900">Registrations</th>}
            <th className="px-8 py-4 font-bold text-gray-900 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item: any) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-8 py-4 font-medium text-gray-900">{item.title || item.name}</td>
              <td className="px-8 py-4 text-gray-500 text-sm">
                {item.type || item.author || 'N/A'}
              </td>
              {activeTab === 'events' && (
                <td className="px-8 py-4">
                  <div className="flex flex-col">
                    <button 
                      onClick={() => onViewRegistrations(item.id)}
                      className="text-sm font-bold text-green-600 hover:underline text-left"
                    >
                      {item.registeredCount || 0} / {item.maxSlots || '∞'} Slots
                    </button>
                    {item.maxSlots > 0 && item.registeredCount >= item.maxSlots && (
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">
                        Maximum slots reached
                      </span>
                    )}
                  </div>
                </td>
              )}
              <td className="px-8 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(item)} className="p-2 text-blue-400 hover:text-blue-600 transition-colors">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackList({ items, onDelete }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-8 py-4 font-bold text-gray-900">User</th>
            <th className="px-8 py-4 font-bold text-gray-900">Event</th>
            <th className="px-8 py-4 font-bold text-gray-900">Rating</th>
            <th className="px-8 py-4 font-bold text-gray-900">Review</th>
            <th className="px-8 py-4 font-bold text-gray-900 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item: any) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-8 py-4 font-medium text-gray-900">{item.userName}</td>
              <td className="px-8 py-4 text-gray-600">{item.eventTitle}</td>
              <td className="px-8 py-4">
                <div className="flex items-center gap-1 text-yellow-500">
                  {item.rating} <Star size={14} fill="currentColor" />
                </div>
              </td>
              <td className="px-8 py-4 text-gray-500 text-sm italic">"{item.review}"</td>
              <td className="px-8 py-4 text-right">
                <button onClick={() => onDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QueryList({ items, onDelete, onReply }: any) {
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="px-8 py-4 font-bold text-gray-900">User</th>
            <th className="px-8 py-4 font-bold text-gray-900">Query</th>
            <th className="px-8 py-4 font-bold text-gray-900">Status & Reply</th>
            <th className="px-8 py-4 font-bold text-gray-900 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item: any) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-8 py-4">
                <div className="font-medium text-gray-900">{item.userName}</div>
                <div className="text-xs text-gray-400">{item.userEmail}</div>
              </td>
              <td className="px-8 py-4 text-gray-600 text-sm max-w-xs">{item.query}</td>
              <td className="px-8 py-4">
                <div className="space-y-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {item.status}
                  </span>
                  {item.status === 'pending' ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type reply..." 
                        value={replyText[item.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [item.id]: e.target.value })}
                        className="text-xs p-2 border rounded-lg outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <button 
                        onClick={() => onReply(item.id, replyText[item.id])}
                        disabled={!replyText[item.id]}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                      >
                        Resolve
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">
                      Reply: {item.adminReply}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-8 py-4 text-right">
                <button onClick={() => onDelete(item.id)} className="p-2 text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="p-8 bg-green-50 rounded-3xl border border-green-100">
      <div className="text-4xl font-bold text-green-700 mb-2">{value}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}
