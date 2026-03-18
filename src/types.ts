export type UserRole = 'admin' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  interests: string[];
  leaderboardPoints: number;
  badges: any[]; // Array of badge objects or strings
  photoURL?: string;
  createdAt: any;
}

export interface ClubEvent {
  id: string;
  title: string;
  description: string;
  type: 'Workshop' | 'Hackathon' | 'Contest';
  dateTime: any;
  registrationLink: string;
  posterUrl: string;
  maxSlots?: number;
  registeredCount?: number;
  isTeamEvent?: boolean;
  minTeamSize?: number;
  maxTeamSize?: number;
}

export interface Opportunity {
  id: string;
  title: string;
  type: 'Internship' | 'Hackathon' | 'Competition' | 'Fellowship';
  domain: string;
  deadline: any;
  description: string;
  externalLink: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  authorId: string;
  category: string;
  content: string;
  imageUrl?: string;
  createdAt: any;
  likes?: string[]; // Array of user UIDs who liked the post
}

export interface BlogComment {
  id: string;
  blogId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

export interface Connection {
  id: string;
  users: string[]; // Array of two user UIDs
  status: 'pending' | 'accepted';
  createdAt: any;
}

export interface Participation {
  id: string;
  userId: string;
  eventId: string;
  status: 'registered' | 'attended' | 'pending_approval';
  userName: string;
  userEmail: string;
  department: string;
  year: string;
  teamId?: string;
  teamName?: string;
  teamRole?: 'leader' | 'member';
  timestamp: any;
}

export interface Team {
  id: string;
  name: string;
  eventId: string;
  leaderId: string;
  leaderName: string;
  members: string[]; // Array of user UIDs
  createdAt: any;
}

export const DOMAINS = [
  'Data Structures and Algorithms',
  'Web Development',
  'AI/ML',
  'Cybersecurity',
  'Competitive Programming'
];
