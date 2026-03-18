import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, where, addDoc, serverTimestamp, updateDoc, doc, getDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ClubEvent, Participation, Team } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Filter, Search, MapPin, Clock, Users, CheckCircle2, AlertCircle, Share2, Download, Loader2, X, Send, Plus, UserPlus, Shield, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toPng } from 'html-to-image';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../App';

function EventCard({ 
  event, 
  index, 
  isRegistered, 
  user,
  onRegisterClick,
  onDeleteClick,
  isAdmin,
  participation
}: { 
  event: ClubEvent; 
  index: number; 
  isRegistered: boolean;
  user: any;
  onRegisterClick: (event: ClubEvent) => void;
  onDeleteClick?: (id: string) => void;
  isAdmin?: boolean;
  participation?: Participation;
}) {
  const isFull = event.maxSlots && event.registeredCount && event.registeredCount >= event.maxSlots;
  const isPending = participation?.status === 'pending_approval';
  const isRegisteredFully = participation?.status === 'registered';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-[32px] shadow-sm border border-green-50 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full relative"
    >
      <div className="h-64 overflow-hidden relative">
        <motion.img 
          whileHover={{ scale: 1.1, rotate: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          src={event.posterUrl || `https://picsum.photos/seed/${event.id}/800/600`} 
          alt={event.title} 
          className="w-full h-full object-cover cursor-pointer"
          referrerPolicy="no-referrer"
        />
        
        {/* Admin Actions */}
        {isAdmin && onDeleteClick && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(event.id);
              }}
              className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all active:scale-90"
              title="Delete Event"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Type Badge */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-white/90 backdrop-blur-md text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-green-100">
            {event.type}
          </div>
          {event.isTeamEvent && (
            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
              <Users size={12} /> Team Event
            </div>
          )}
        </div>

        {/* Status Badge */}
        {isFull && !isRegisteredFully && !isPending && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
            Event Full
          </div>
        )}
        {isRegisteredFully && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
            Registered
          </div>
        )}
        {isPending && (
          <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
            Pending Approval
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-green-600" />
            {event.dateTime?.toDate ? format(event.dateTime.toDate(), 'MMM d, yyyy') : 'TBA'}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-green-600" />
            {event.dateTime?.toDate ? format(event.dateTime.toDate(), 'p') : 'TBA'}
          </div>
        </div>

        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-green-700 transition-colors leading-tight">
          {event.title}
        </h3>
        
        <p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed font-medium">
          {event.description}
        </p>

        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-tighter mb-1">
              <Users size={14} className="text-green-600" />
              {event.registeredCount || 0} / {event.maxSlots || '∞'} Slots
            </div>
            {event.isTeamEvent && (
              <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                {event.minTeamSize}-{event.maxTeamSize} Members
              </div>
            )}
          </div>
          
          {isRegisteredFully ? (
            <button 
              onClick={() => onRegisterClick(event)}
              className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              <CheckCircle2 size={18} /> Manage
            </button>
          ) : isPending ? (
            <button 
              onClick={() => onRegisterClick(event)}
              className="flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-widest hover:underline"
            >
              <Clock size={18} /> Pending
            </button>
          ) : isFull ? (
            <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-widest opacity-50">
              <AlertCircle size={18} /> Sold Out
            </div>
          ) : (
            <button 
              onClick={() => onRegisterClick(event)}
              className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95"
            >
              Register
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PendingRequests({ eventId, teamId, onApprove, onReject }: { eventId: string, teamId: string, onApprove: (pId: string, uid: string, tId: string) => void, onReject: (pId: string) => void }) {
  const [requests, setRequests] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'participation'),
      where('eventId', '==', eventId),
      where('teamId', '==', teamId),
      where('status', '==', 'pending_approval')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participation)));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching requests:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId, teamId]);

  if (loading) return <div className="text-xs text-gray-400 animate-pulse">Loading requests...</div>;
  if (requests.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
      <h4 className="text-[10px] font-black text-orange-700 uppercase tracking-widest mb-3 flex items-center gap-2">
        <AlertCircle size={14} /> Pending Join Requests ({requests.length})
      </h4>
      <div className="space-y-2">
        {requests.map(req => (
          <div key={req.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm">
            <div>
              <div className="text-sm font-bold text-gray-900">{req.userName}</div>
              <div className="text-[10px] text-gray-500">{req.userEmail}</div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onReject(req.id)}
                className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Ignore
              </button>
              <button 
                onClick={() => onApprove(req.id, req.userId, teamId)}
                className="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [userParticipations, setUserParticipations] = useState<Record<string, Participation>>({});
  
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    department: '',
    year: '1st Year',
    teamName: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [eventTeams, setEventTeams] = useState<Team[]>([]);
  const [eventParticipations, setEventParticipations] = useState<Participation[]>([]);
  const [userTeamStatus, setUserTeamStatus] = useState<Participation | null>(null);
  const [isTeamActionLoading, setIsTeamActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'individual' | 'team'>('individual');
  const [inviteEmail, setInviteEmail] = useState('');

  const filters = ['All', 'Workshop', 'Hackathon', 'Contest'];

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('dateTime', 'desc'));
      const snap = await getDocs(q);
      
      // Fetch registration counts for each event
      const eventsData = await Promise.all(snap.docs.map(async (doc) => {
        const event = { id: doc.id, ...doc.data() } as ClubEvent;
        const pQuery = query(collection(db, 'participation'), where('eventId', '==', doc.id));
        const pSnap = await getDocs(pQuery);
        return { ...event, registeredCount: pSnap.size };
      }));

      setEvents(eventsData);
      setFilteredEvents(eventsData);

      // Fetch user's participations
      if (user) {
        const uQuery = query(collection(db, 'participation'), where('userId', '==', user.uid));
        const uSnap = await getDocs(uQuery);
        const participations: Record<string, Participation> = {};
        uSnap.docs.forEach(d => {
          const data = { id: d.id, ...d.data() } as Participation;
          participations[data.eventId] = data;
        });
        setUserParticipations(participations);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTeams = async (eventId: string) => {
    try {
      const q = query(collection(db, 'teams'), where('eventId', '==', eventId));
      const snap = await getDocs(q);
      const teams = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setEventTeams(teams);

      const pq = query(collection(db, 'participation'), where('eventId', '==', eventId));
      const psnap = await getDocs(pq);
      const participations = psnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participation));
      setEventParticipations(participations);

      if (user) {
        const userP = participations.find(p => p.userId === user.uid);
        if (userP) {
          setUserTeamStatus(userP);
        } else {
          setUserTeamStatus(null);
        }
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const sendEmail = async (email: string, userName: string, eventTitle: string, status: string) => {
    try {
      await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          userName,
          eventTitle,
          status,
          dateTime: selectedEvent?.dateTime?.toDate ? format(selectedEvent.dateTime.toDate(), 'PPP p') : 'TBA',
          location: selectedEvent?.registrationLink ? 'Online/Check Portal' : 'Main Hall'
        })
      });
    } catch (emailErr) {
      console.error("Error sending confirmation email:", emailErr);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !selectedEvent || !registrationForm.teamName) return;

    // Check if already registered for this event
    if (userParticipations[selectedEvent.id]) {
      alert("You are already registered for this event.");
      return;
    }

    setIsTeamActionLoading(true);
    try {
      const teamRef = await addDoc(collection(db, 'teams'), {
        name: registrationForm.teamName,
        eventId: selectedEvent.id,
        leaderId: user.uid,
        leaderName: profile.name,
        members: [user.uid],
        createdAt: serverTimestamp()
      });

      await addDoc(collection(db, 'participation'), {
        userId: user.uid,
        eventId: selectedEvent.id,
        status: 'registered',
        userName: profile.name,
        userEmail: profile.email,
        department: registrationForm.department,
        year: registrationForm.year,
        teamId: teamRef.id,
        teamName: registrationForm.teamName,
        teamRole: 'leader',
        timestamp: serverTimestamp()
      });

      await sendEmail(profile.email, profile.name, selectedEvent.title, 'Team Leader (Registered)');
      
      fetchEvents();
      fetchEventTeams(selectedEvent.id);
      setShowConfirmation(true);
    } catch (err) {
      console.error("Error creating team:", err);
      alert("Failed to create team.");
    } finally {
      setIsTeamActionLoading(false);
    }
  };

  const handleJoinTeam = async (team: Team) => {
    if (!user || !profile || !selectedEvent) return;

    // Check if already registered for this event
    if (userParticipations[selectedEvent.id]) {
      alert("You are already registered for this event.");
      return;
    }

    // Check if team is full
    if (selectedEvent.maxTeamSize && team.members.length >= selectedEvent.maxTeamSize) {
      alert("This team is already full!");
      return;
    }

    setIsTeamActionLoading(true);
    try {
      await addDoc(collection(db, 'participation'), {
        userId: user.uid,
        eventId: selectedEvent.id,
        status: 'pending_approval',
        userName: profile.name,
        userEmail: profile.email,
        department: registrationForm.department || '',
        year: registrationForm.year || '1st Year',
        teamId: team.id,
        teamName: team.name,
        teamRole: 'member',
        timestamp: serverTimestamp()
      });

      fetchEvents();
      fetchEventTeams(selectedEvent.id);
      alert("Join request sent to team leader!");
    } catch (err) {
      console.error("Error joining team:", err);
      alert("Failed to send join request.");
    } finally {
      setIsTeamActionLoading(false);
    }
  };

  const handleApproveMember = async (participationId: string, memberUid: string, teamId: string) => {
    if (!selectedEvent) return;
    
    setIsTeamActionLoading(true);
    try {
      // 1. Update participation status
      await updateDoc(doc(db, 'participation', participationId), {
        status: 'registered'
      });

      // 2. Add member to team document
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;
        
        // Final check on max size
        if (selectedEvent.maxTeamSize && teamData.members.length >= selectedEvent.maxTeamSize) {
          alert("Team is full! Cannot approve more members.");
          return;
        }

        await updateDoc(doc(db, 'teams', teamId), {
          members: [...teamData.members, memberUid]
        });

        // 3. Send email to approved member
        const pDoc = await getDoc(doc(db, 'participation', participationId));
        if (pDoc.exists()) {
          const pData = pDoc.data();
          await sendEmail(pData.userEmail, pData.userName, selectedEvent.title, 'Team Member (Approved)');
        }

        alert("Member approved!");
        fetchEvents();
        fetchEventTeams(selectedEvent.id);
      }
    } catch (err) {
      console.error("Error approving member:", err);
      alert("Failed to approve member.");
    } finally {
      setIsTeamActionLoading(false);
    }
  };

  const handleRejectMember = async (participationId: string) => {
    if (!selectedEvent) return;
    
    if (!window.confirm("Are you sure you want to ignore this request?")) return;

    setIsTeamActionLoading(true);
    try {
      await deleteDoc(doc(db, 'participation', participationId));
      alert("Request ignored.");
      fetchEvents();
      fetchEventTeams(selectedEvent.id);
    } catch (err) {
      console.error("Error rejecting member:", err);
      alert("Failed to ignore request.");
    } finally {
      setIsTeamActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedEvent || !userTeamStatus) return;
    
    if (!window.confirm("Are you sure you want to revoke your registration/request? This will remove you from the team if applicable.")) return;

    setIsTeamActionLoading(true);
    try {
      // If leader, we might want to delete the whole team or transfer leadership.
      // For now, let's just delete the participation.
      // If the user is a leader, we should probably warn that the team will be orphaned or deleted.
      
      if (userTeamStatus.teamRole === 'leader') {
        if (!window.confirm("You are the Team Leader. Revoking your request will also delete the team. Continue?")) {
          setIsTeamActionLoading(false);
          return;
        }
        // Delete team document
        if (userTeamStatus.teamId) {
          await deleteDoc(doc(db, 'teams', userTeamStatus.teamId));
          // Also delete all other participations for this team?
          // For simplicity, let's just delete the leader's participation.
          // In a real app, you'd handle this more gracefully.
        }
      } else if (userTeamStatus.teamId) {
        // Remove from team members list
        const teamDoc = await getDoc(doc(db, 'teams', userTeamStatus.teamId));
        if (teamDoc.exists()) {
          const teamData = teamDoc.data() as Team;
          await updateDoc(doc(db, 'teams', userTeamStatus.teamId), {
            members: teamData.members.filter(m => m !== user.uid)
          });
        }
      }

      await deleteDoc(doc(db, 'participation', userTeamStatus.id));
      alert("Registration revoked successfully.");
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Error revoking registration:", err);
      alert("Failed to revoke registration.");
    } finally {
      setIsTeamActionLoading(false);
    }
  };

  const handleAddMemberByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEvent || !userTeamStatus || userTeamStatus.teamRole !== 'leader' || !inviteEmail) return;

    setIsTeamActionLoading(true);
    try {
      // Find user by email
      const uQuery = query(collection(db, 'users'), where('email', '==', inviteEmail));
      const uSnap = await getDocs(uQuery);
      
      if (uSnap.empty) {
        alert("User not found with this email.");
        return;
      }

      const invitedUser = uSnap.docs[0].data();
      const invitedUid = uSnap.docs[0].id;

      // Check if already in a team for this event
      const pQuery = query(
        collection(db, 'participation'), 
        where('eventId', '==', selectedEvent.id),
        where('userId', '==', invitedUid)
      );
      const pSnap = await getDocs(pQuery);
      if (!pSnap.empty) {
        alert("User is already registered or has a pending request for this event.");
        return;
      }

      // Add them directly as registered member
      const teamId = userTeamStatus.teamId!;
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (teamDoc.exists()) {
        const teamData = teamDoc.data() as Team;
        
        if (selectedEvent.maxTeamSize && teamData.members.length >= selectedEvent.maxTeamSize) {
          alert("Team is full!");
          return;
        }

        await addDoc(collection(db, 'participation'), {
          userId: invitedUid,
          eventId: selectedEvent.id,
          status: 'registered',
          userName: invitedUser.name,
          userEmail: invitedUser.email,
          department: 'Invited',
          year: 'N/A',
          teamId: teamId,
          teamName: teamData.name,
          teamRole: 'member',
          timestamp: serverTimestamp()
        });

        await updateDoc(doc(db, 'teams', teamId), {
          members: [...teamData.members, invitedUid]
        });

        await sendEmail(invitedUser.email, invitedUser.name, selectedEvent.title, 'Team Member (Added by Leader)');
        
        alert("Member added successfully!");
        setInviteEmail('');
        fetchEvents();
        fetchEventTeams(selectedEvent.id);
      }
    } catch (err) {
      console.error("Error adding member:", err);
      alert("Failed to add member.");
    } finally {
      setIsTeamActionLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleRegister triggered");
    if (!user || !profile || !selectedEvent) {
      console.log("Missing data:", { user: !!user, profile: !!profile, selectedEvent: !!selectedEvent });
      return;
    }

    // Check if already registered for this event
    if (userParticipations[selectedEvent.id]) {
      alert("You are already registered for this event.");
      return;
    }

    setIsRegistering(true);
    try {
      console.log("Attempting individual registration for event:", selectedEvent.id);
      const participationData = {
        userId: user.uid,
        eventId: selectedEvent.id,
        status: 'registered',
        userName: profile.name || user.displayName || 'Anonymous',
        userEmail: profile.email || user.email,
        department: registrationForm.department || 'N/A',
        year: registrationForm.year || '1st Year',
        timestamp: serverTimestamp()
      };
      
      console.log("Participation data:", participationData);
      
      await addDoc(collection(db, 'participation'), participationData);

      console.log("Registration successful in Firestore");
      setShowConfirmation(true);
      await fetchEvents(); // Refresh counts and participations

      // Send confirmation email
      try {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: profile.email || user.email,
            userName: profile.name || user.displayName || 'User',
            eventTitle: selectedEvent.title,
            status: 'Registered',
            dateTime: selectedEvent.dateTime?.toDate ? format(selectedEvent.dateTime.toDate(), 'PPP p') : 'TBA',
            location: selectedEvent.registrationLink ? 'Online/Check Portal' : 'Main Hall'
          })
        });
      } catch (emailErr) {
        console.error("Error sending confirmation email:", emailErr);
      }
    } catch (err) {
      console.error("Error during registration:", err);
      alert("Registration failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    
    try {
      await deleteDoc(doc(db, 'events', eventId));
      alert("Event deleted successfully.");
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event. You might not have permission.");
    }
  };

  useEffect(() => {
    let result = events;
    if (activeFilter !== 'All') {
      result = result.filter(e => e.type === activeFilter);
    }
    if (searchTerm) {
      result = result.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEvents(result);
  }, [activeFilter, searchTerm, events]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Coding Events</h2>
        <p className="text-gray-600 text-lg">Discover and participate in the most exciting tech events at RIT.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeFilter === filter ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event, index) => (
            <EventCard 
              key={event.id} 
              event={event} 
              index={index} 
              isRegistered={!!userParticipations[event.id]}
              participation={userParticipations[event.id]}
              user={user}
              isAdmin={profile?.role === 'admin'}
              onDeleteClick={handleDeleteEvent}
              onRegisterClick={(e) => {
                if (!user) {
                  alert("Please log in to register for events.");
                  return;
                }
                setSelectedEvent(e);
                setShowConfirmation(false);
                if (e.isTeamEvent) {
                  fetchEventTeams(e.id);
                  setActiveTab('team');
                } else {
                  setActiveTab('individual');
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your filters or search term.</p>
        </div>
      )}

      {/* Registration Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] p-8 md:p-12 max-w-xl w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-8 right-8 flex items-center gap-4">
                {profile?.role === 'admin' && (
                  <button 
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 size={24} />
                  </button>
                )}
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {!showConfirmation ? (
                <>
                  <div className="mb-8">
                    <div className="inline-block px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      {selectedEvent.type}
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">{selectedEvent.title}</h3>
                    <p className="text-gray-500 text-sm font-medium">Please confirm your details to register for this event.</p>
                  </div>

                  {selectedEvent.isTeamEvent && (
                    <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
                      <button 
                        onClick={() => setActiveTab('individual')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'individual' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
                      >
                        Individual
                      </button>
                      <button 
                        onClick={() => setActiveTab('team')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'team' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}
                      >
                        Team
                      </button>
                    </div>
                  )}

                  {activeTab === 'individual' ? (
                    <form onSubmit={handleRegister} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500 font-bold text-sm">
                            {profile?.name}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-500 font-bold text-sm truncate">
                            {profile?.email}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. CSE, IT, ECE"
                            value={registrationForm.department}
                            onChange={(e) => setRegistrationForm({...registrationForm, department: e.target.value})}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Year of Study</label>
                          <select 
                            value={registrationForm.year}
                            onChange={(e) => setRegistrationForm({...registrationForm, year: e.target.value})}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-sm"
                          >
                            <option>1st Year</option>
                            <option>2nd Year</option>
                            <option>3rd Year</option>
                            <option>4th Year</option>
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={isRegistering}
                        className="w-full py-5 bg-green-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                      >
                        {isRegistering ? (
                          <>
                            <Loader2 size={20} className="animate-spin" /> Processing...
                          </>
                        ) : (
                          <>
                            <Send size={20} /> Confirm Registration
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-8">
                      {userTeamStatus ? (
                        <div className="space-y-6">
                          <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-2xl shadow-sm text-green-600">
                                  <Users size={24} />
                                </div>
                                <div>
                                  <h4 className="text-lg font-black text-gray-900">{userTeamStatus.teamName}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${userTeamStatus.teamRole === 'leader' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
                                      {userTeamStatus.teamRole === 'leader' ? 'Team Lead' : 'Team Member'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      Status: {userTeamStatus.status === 'registered' ? 'Registered' : 'Pending Approval'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={handleRevoke}
                                disabled={isTeamActionLoading}
                                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                              >
                                <X size={12} /> Revoke
                              </button>
                            </div>

                            {/* Team Members List */}
                            {userTeamStatus.teamId && (
                              <div className="mb-6 bg-white/50 rounded-2xl p-4 border border-green-100/50">
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Team Members</h5>
                                <div className="space-y-2">
                                  {eventParticipations
                                    .filter(p => p.teamId === userTeamStatus.teamId && p.status === 'registered')
                                    .map((p) => (
                                      <div key={p.id} className="flex items-center justify-between text-sm font-bold text-gray-700">
                                        <div className="flex items-center gap-2">
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                          {p.userName} {p.userId === user.uid && '(You)'}
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                                          {p.teamRole === 'leader' ? 'Lead' : 'Member'}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                            
                            {userTeamStatus.teamRole === 'leader' && (
                              <div className="space-y-4">
                                <PendingRequests 
                                  eventId={selectedEvent.id} 
                                  teamId={userTeamStatus.teamId!} 
                                  onApprove={handleApproveMember} 
                                  onReject={handleRejectMember}
                                />
                                
                                <div className="pt-4 border-t border-green-100">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Add Member by Email</label>
                                  <form onSubmit={handleAddMemberByEmail} className="flex gap-2">
                                    <input 
                                      type="email"
                                      placeholder="student@example.com"
                                      value={inviteEmail}
                                      onChange={(e) => setInviteEmail(e.target.value)}
                                      className="flex-1 p-3 bg-white border border-green-100 rounded-xl outline-none text-sm font-bold"
                                    />
                                    <button 
                                      type="submit"
                                      disabled={isTeamActionLoading || !inviteEmail}
                                      className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 disabled:opacity-50"
                                    >
                                      <UserPlus size={20} />
                                    </button>
                                  </form>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {/* Create Team */}
                          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Plus size={18} className="text-green-600" /> Create New Team
                            </h4>
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                              <input 
                                type="text"
                                required
                                placeholder="Team Name"
                                value={registrationForm.teamName}
                                onChange={(e) => setRegistrationForm({...registrationForm, teamName: e.target.value})}
                                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-sm"
                              />
                              <button 
                                type="submit"
                                disabled={isTeamActionLoading}
                                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {isTeamActionLoading ? <Loader2 className="animate-spin" size={20} /> : <Shield size={18} />}
                                Create & Register as Team Lead
                              </button>
                            </form>
                          </div>

                          {/* Join Team */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Users size={18} className="text-green-600" /> Join Existing Team
                            </h4>
                            <div className="max-h-64 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                              {eventTeams.length > 0 ? eventTeams.map(team => (
                                <div key={team.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-green-200 transition-all shadow-sm">
                                  <div>
                                    <div className="font-bold text-gray-900">{team.name}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                      Leader: {team.leaderName} • {team.members.length} Members
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => handleJoinTeam(team)}
                                    disabled={isTeamActionLoading || (selectedEvent.maxTeamSize ? team.members.length >= selectedEvent.maxTeamSize : false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all disabled:opacity-30"
                                  >
                                    Join Request
                                  </button>
                                </div>
                              )) : (
                                <div className="text-center py-8 text-gray-400 text-sm font-medium italic">
                                  No teams created yet.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4">Registration Confirmed!</h3>
                  <p className="text-gray-500 font-medium mb-12">
                    You've successfully registered for <span className="text-gray-900 font-bold">{selectedEvent.title}</span>. 
                    Your spot is secured!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => navigate('/portal')}
                      className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      View My Events
                    </button>
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                    >
                      Back to Events
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
