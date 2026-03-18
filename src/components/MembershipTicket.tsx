import React, { useRef, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Upload, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../types';
import { motion } from 'framer-motion';

interface MembershipTicketProps {
  profile: UserProfile;
  onPhotoUpload: (base64: string) => void;
}

export default function MembershipTicket({ profile, onPhotoUpload }: MembershipTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [userPhotoBase64, setUserPhotoBase64] = useState<string | null>(null);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  // Use logo URL directly
  useEffect(() => {
    setLogoBase64('https://www.geeksforgeeks.org/wp-content/uploads/gfg_200X200.png');
  }, []);

  // Use user photo URL directly
  useEffect(() => {
    setUserPhotoBase64(profile.photoURL || null);
  }, [profile.photoURL]);

  // Generate QR Code as Data URL for "Smart Pre-loading"
  useEffect(() => {
    const timer = setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        setQrCodeDataUrl(canvas.toDataURL());
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [profile.uid]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onPhotoUpload(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const profileUrl = `${window.location.origin}/profile/${profile.uid}`;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-col gap-8 items-center justify-center w-full">
        <div className="w-full flex justify-center overflow-hidden p-2">
          <div className="scale-[0.5] sm:scale-[0.7] md:scale-100 origin-top">
            <div 
              ref={ticketRef}
              className="relative w-[600px] h-[350px] bg-white rounded-[40px] overflow-hidden shadow-2xl border-4 border-green-600 flex"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <div className="w-1/3 bg-green-600 flex flex-col items-center justify-center p-8 text-white relative">
                <div 
                  className="relative w-32 h-32 mb-4 cursor-pointer group perspective-1000"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <motion.div
                    className="w-full h-full relative preserve-3d"
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <div className="absolute inset-0 backface-hidden">
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
                        {userPhotoBase64 ? (
                          <img src={userPhotoBase64} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={60} className="text-white/50" />
                        )}
                      </div>
                    </div>

                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                      <div className="w-full h-full rounded-full border-4 border-white bg-white flex flex-col items-center justify-center p-4 shadow-xl">
                        {qrCodeDataUrl ? (
                          <img src={qrCodeDataUrl} alt="QR Code" className="w-20 h-20" />
                        ) : (
                          <QRCodeCanvas value={profileUrl} size={80} fgColor="#15803d" level="H" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <img 
                      src={logoBase64 || 'https://www.geeksforgeeks.org/wp-content/uploads/gfg_200X200.png'} 
                      alt="GFG Logo" 
                      className="w-8 h-8 bg-white rounded-full p-1 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <h2 className="text-xl font-black tracking-tighter uppercase leading-none">GFG RIT</h2>
                  </div>
                  <p className="text-[10px] font-bold tracking-widest opacity-80 uppercase">Campus Club</p>
                </div>
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg"></div>
                
                {/* Hidden QR Canvas for pre-loading if not visible */}
                <div className="hidden">
                  <QRCodeCanvas value={profileUrl} size={80} fgColor="#15803d" level="H" />
                </div>
              </div>

              <div className="w-2/3 p-10 flex flex-col bg-white relative">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 leading-tight mb-1">{profile.name}</h3>
                    <p className="text-green-600 font-bold text-sm tracking-wide">{profile.email}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <img 
                      src={logoBase64 || 'https://www.geeksforgeeks.org/wp-content/uploads/gfg_200X200.png'} 
                      alt="GFG Logo" 
                      className="w-12 h-12 object-contain mb-1"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Official Member</div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-1 border-l-2 border-green-100 pl-4">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Membership Role</p>
                      <p className="text-xl font-bold text-gray-800 capitalize">{profile.role}</p>
                    </div>
                    <div className="space-y-1 border-l-2 border-green-100 pl-4">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Geek Points</p>
                      <p className="text-xl font-bold text-gray-800">{profile.leaderboardPoints}</p>
                    </div>
                    <div className="space-y-1 border-l-2 border-green-100 pl-4">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Member ID</p>
                      <p className="text-sm font-mono font-bold text-gray-500 uppercase">#{profile.uid.slice(0, 8)}</p>
                    </div>
                    <div className="space-y-1 border-l-2 border-green-100 pl-4">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Status</p>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-bold text-green-600 uppercase">Active</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex gap-2">
                    {profile.badges.slice(0, 3).map((badge, i) => (
                      <div key={i} className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-full border border-green-100 uppercase tracking-tighter">
                        {badge}
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                    Authentic Member
                  </div>
                </div>

                {/* Decorative Notch */}
                <div className="absolute top-1/2 -right-4 w-8 h-8 bg-green-600 rounded-full -translate-y-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
          <div className="flex-1 bg-white p-8 rounded-[32px] shadow-xl border border-green-50">
            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-tight">Customize Your Ticket</h4>
            
            <div className="flex flex-col items-center gap-6">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-green-200 rounded-[24px] cursor-pointer hover:bg-green-50 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-xs text-green-600 font-black uppercase tracking-widest">Upload Photo</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              
              <p className="text-[10px] text-gray-400 font-medium text-center">
                Upload your photo to personalize your membership ticket.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
