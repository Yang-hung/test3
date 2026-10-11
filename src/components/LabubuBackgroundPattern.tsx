import React from 'react';
import { motion } from 'motion/react';

// Directly displays the user's authentic image file from /assets/img_labubu_avatar.png
export const LabubuStamp: React.FC<{
  size?: number;
  opacity?: number;
  className?: string;
}> = ({ size = 80, opacity = 0.25, className = '' }) => {
  return (
    <img
      src="/assets/img_labubu_avatar.png"
      alt="Labubu stamp"
      width={size}
      height={size}
      className={`object-contain select-none filter drop-shadow-sm pointer-events-none ${className}`}
      style={{ opacity, width: size, height: 'auto' }}
    />
  );
};

export const GirlyPinkBackground: React.FC = () => {
  // Preset stamp positions scattered like high-end boutique wrapping paper/stationery pattern
  const stamps = [
    { top: '3%', left: '4%', size: 76, rotate: -12, delay: 0 },
    { top: '8%', right: '6%', size: 84, rotate: 14, delay: 1.2 },
    { top: '22%', left: '12%', size: 68, rotate: 8, delay: 2.1 },
    { top: '26%', right: '14%', size: 74, rotate: -10, delay: 0.8 },
    { top: '42%', left: '3%', size: 88, rotate: 16, delay: 1.8 },
    { top: '48%', right: '5%', size: 82, rotate: -14, delay: 2.5 },
    { top: '65%', left: '10%', size: 76, rotate: -8, delay: 1.0 },
    { top: '68%', right: '12%', size: 85, rotate: 12, delay: 0.5 },
    { top: '85%', left: '5%', size: 80, rotate: 15, delay: 2.2 },
    { top: '88%', right: '7%', size: 78, rotate: -12, delay: 1.6 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Base Girlish Pastel Pink Dreamy Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff2f6] via-[#fde8f0] to-[#fbdbe8]" />

      {/* 2. Soft pastel bokeh halos */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-300/35 blur-3xl" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 rounded-full bg-pink-200/45 blur-3xl" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl" />

      {/* 3. Cute Girly Sparkle Accents (✨, 🌸, 🎀, 💕) */}
      <div className="absolute top-12 left-1/4 text-pink-300/50 text-xl animate-pulse">✨</div>
      <div className="absolute top-28 right-1/3 text-pink-400/40 text-lg">🌸</div>
      <div className="absolute top-1/2 left-8 text-rose-300/45 text-xl animate-bounce" style={{ animationDuration: '4s' }}>🎀</div>
      <div className="absolute top-3/4 right-1/4 text-pink-300/50 text-2xl animate-pulse">✨</div>
      <div className="absolute bottom-24 left-1/3 text-pink-400/40 text-lg">💕</div>
      <div className="absolute bottom-1/3 right-8 text-rose-300/45 text-xl">🌸</div>

      {/* 4. SCATTERED LABUBU AVATAR STAMP PATTERN (Directly uses original PNG file) */}
      {stamps.map((stamp, idx) => (
        <motion.div
          key={idx}
          className="absolute hidden sm:block"
          style={{
            top: stamp.top,
            left: stamp.left,
            right: stamp.right,
          }}
          animate={{
            y: [-4, 5, -4],
            rotate: [stamp.rotate - 2, stamp.rotate + 2, stamp.rotate - 2],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: stamp.delay,
          }}
        >
          <LabubuStamp size={stamp.size} opacity={0.25} />
        </motion.div>
      ))}

      {/* Mobile-friendly stamp corners */}
      <div className="absolute top-4 right-4 sm:hidden opacity-25 rotate-12">
        <LabubuStamp size={60} />
      </div>
      <div className="absolute bottom-16 left-4 sm:hidden opacity-25 -rotate-12">
        <LabubuStamp size={60} />
      </div>

      {/* 5. Delicate polka-dot textile texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 18px 18px, #f43f5e 2px, transparent 0%)`,
          backgroundSize: '36px 36px',
        }}
      />
    </div>
  );
};
