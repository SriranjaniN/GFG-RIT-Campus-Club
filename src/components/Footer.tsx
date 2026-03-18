import React from 'react';
import { Instagram, Linkedin, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-green-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img 
                className="h-10 w-auto" 
                src="https://www.geeksforgeeks.org/wp-content/uploads/gfg_200X200.png" 
                alt="GFG Logo" 
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-xl text-green-700">GFG RIT</span>
            </div>
            <p className="text-gray-600 max-w-md">
              The official GeeksforGeeks Campus Club of RIT Chennai. 
              Empowering students with coding skills, opportunities, and a vibrant community.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/events" className="text-gray-600 hover:text-green-600">Events</a></li>
              <li><a href="/resources" className="text-gray-600 hover:text-green-600">Resources</a></li>
              <li><a href="/blog" className="text-gray-600 hover:text-green-600">Blog</a></li>
              <li><a href="/portal" className="text-gray-600 hover:text-green-600">User Portal</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/geeksforgeeks.rit" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-pink-600 transition-all">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/in/gfg-rit/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-blue-700 transition-all">
                <Linkedin size={20} />
              </a>
              <a href="https://chat.whatsapp.com/ClEuUW8ubg509ijOlaMuFm" target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-green-600 transition-all">
                <MessageCircle size={20} />
              </a>
              <a href="mailto:gfgrit@gmail.com" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md text-gray-600 transition-all">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} GeeksforGeeks Club - RIT. "Innovation begins with curiosity." 💚
          </p>
        </div>
      </div>
    </footer>
  );
}
