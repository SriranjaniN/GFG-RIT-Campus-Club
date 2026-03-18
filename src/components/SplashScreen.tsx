import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 1000); // Wait for exit animation
    }, 3500); // Total duration of splash (decreased by 1s)

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Particle shimmer effect
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
  }));

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(circle at center, #f0fdf4 0%, #bbf7d0 100%)',
          }}
        >
          {/* Background Shimmer Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.4, 0],
                scale: [0, 1, 0],
                x: [`${p.x}%`, `${p.x + (Math.random() - 0.5) * 5}%`],
                y: [`${p.y}%`, `${p.y + (Math.random() - 0.5) * 5}%`],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
              className="absolute rounded-full bg-green-600/20 blur-[1px]"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
            />
          ))}

          {/* Logo Container */}
          <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
            {/* Tracing Lines Animation */}
            <svg
              viewBox="0 0 200 200"
              className="absolute inset-0 w-full h-full z-10"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Converging Lines Effect */}
              <motion.line
                x1="0" y1="100" x2="70" y2="100"
                stroke="#064e3b" strokeWidth="2" strokeOpacity="0.6"
                filter="url(#glow)"
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, delay: 0.1 }}
              />
              <motion.line
                x1="200" y1="100" x2="130" y2="100"
                stroke="#064e3b" strokeWidth="2" strokeOpacity="0.6"
                filter="url(#glow)"
                initial={{ x: 200, opacity: 0 }}
                animate={{ x: 0, opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, delay: 0.2 }}
              />
              <motion.line
                x1="100" y1="0" x2="100" y2="70"
                stroke="#064e3b" strokeWidth="2" strokeOpacity="0.6"
                filter="url(#glow)"
                initial={{ y: -200, opacity: 0 }}
                animate={{ y: 0, opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, delay: 0.3 }}
              />
              <motion.line
                x1="100" y1="200" x2="100" y2="130"
                stroke="#064e3b" strokeWidth="2" strokeOpacity="0.6"
                filter="url(#glow)"
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, delay: 0.4 }}
              />
            </svg>

            {/* Official GFG Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, filter: 'brightness(0)' }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                filter: 'brightness(1)',
              }}
              transition={{ 
                duration: 1.2, 
                delay: 1,
                ease: "easeOut"
              }}
              className="relative z-20"
            >
              <img 
                src="https://www.geeksforgeeks.org/wp-content/uploads/gfg_200X200.png" 
                alt="GFG Logo" 
                className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.1)]"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Glowing Aura */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: [0, 0.1, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-green-400 rounded-full blur-3xl"
            />
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="absolute bottom-12 text-center"
          >
            <h1 className="text-green-900 font-bold text-xl tracking-[0.2em] uppercase mb-2">GFG RIT</h1>
            <p className="text-green-700/60 text-xs tracking-widest uppercase">Innovation begins with curiosity</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
