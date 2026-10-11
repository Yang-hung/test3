import React, { useState } from 'react';
import { motion } from 'motion/react';

export type LabubuAction =
  | 'idle'
  | 'clap'
  | 'shake'
  | 'drop-watch'
  | 'bend-pickup'
  | 'spin-windup'
  | 'spin-swipe'
  | 'cheer';

interface LabubuCharacterProps {
  action?: LabubuAction;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isHappy?: boolean;
}

export const LabubuCharacter: React.FC<LabubuCharacterProps> = ({
  action = 'idle',
  size = 'md',
  className = '',
  isHappy = false,
}) => {
  // If user adds a full body image, check for it first, otherwise fallback to avatar
  const [imgSrc, setImgSrc] = useState('/assets/img_labubu_body.png');

  const dimensions = {
    sm: { width: 130, height: 160 },
    md: { width: 185, height: 230 },
    lg: { width: 235, height: 290 },
    xl: { width: 285, height: 350 },
  }[size];

  const isClapping = action === 'clap';
  const isCheering = action === 'cheer' || isHappy;
  const isDropping = action === 'drop-watch';
  const isBending = action === 'bend-pickup';
  const isSpinWindup = action === 'spin-windup';
  const isSpinSwipe = action === 'spin-swipe';
  const isShaking = action === 'shake';

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none transition-transform ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      {/* Dynamic Animated Puppet of the UNALTERED Original Image File */}
      <motion.div
        animate={
          isClapping
            ? {
                // Energetic joyful hop & bounce
                y: [0, -10, 0],
                scale: [1, 1.05, 1],
              }
            : isShaking
            ? {
                // High frequency vibration while shaking fortune cylinder
                x: [-3.5, 3.5, -3.5],
                y: [-2, 2, -2],
                rotate: [-2.5, 2.5, -2.5],
              }
            : isCheering
            ? {
                // Joyful celebratory jump
                y: [0, -28, 0],
                scale: [1, 1.08, 0.98, 1],
              }
            : isBending
            ? {
                // Smooth forward bend to reach for the stick on the ground
                y: [0, 18, 0],
                rotate: [0, 14, 0],
                originY: '90%',
              }
            : isSpinWindup
            ? {
                // Anticipation lean-back
                rotate: -8,
                x: -6,
                originY: '90%',
              }
            : isSpinSwipe
            ? {
                // Forceful forward swipe
                rotate: 12,
                x: 10,
                originY: '90%',
              }
            : isDropping
            ? {
                // Surprised tilt looking down
                rotate: 5,
                y: 6,
              }
            : {
                // Natural gentle breathing float
                y: [0, -5, 0],
                scaleY: [1, 1.02, 1],
              }
        }
        transition={{
          duration:
            isClapping
              ? 0.18
              : isShaking
              ? 0.1
              : isCheering
              ? 0.45
              : isBending
              ? 1.4
              : isSpinSwipe
              ? 0.25
              : 2.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex items-center justify-center w-full h-full"
      >
        {/* DIRECTLY RENDERING THE ORIGINAL IMAGE FILE (Zero vector redrawing or contour remodeling) */}
        <img
          src={imgSrc}
          alt="Labubu 原圖"
          onError={() => {
            // Fallback to avatar if body png does not exist
            if (imgSrc !== '/assets/img_labubu_avatar.png') {
              setImgSrc('/assets/img_labubu_avatar.png');
            }
          }}
          className="max-w-full max-h-full object-contain filter drop-shadow-lg pointer-events-none select-none"
        />

        {/* Clapping sparks effect */}
        {isClapping && (
          <motion.div
            animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.18, repeat: Infinity }}
            className="absolute z-20 flex items-center justify-center pointer-events-none -bottom-2"
          >
            <span className="text-2xl filter drop-shadow">👏</span>
            <span className="absolute -top-3 text-amber-300 text-lg">✨</span>
          </motion.div>
        )}

        {/* Swipe motion speed lines */}
        {isSpinSwipe && (
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-2xl font-bold text-cyan-400 animate-pulse">
            💨
          </div>
        )}

        {/* Cheering celebration stars */}
        {isCheering && (
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.45, repeat: Infinity }}
            className="absolute -top-4 z-20 flex items-center gap-2 pointer-events-none"
          >
            <span className="text-pink-400 text-lg">✨</span>
            <span className="text-amber-400 text-xl">🎉</span>
            <span className="text-pink-400 text-lg">✨</span>
          </motion.div>
        )}
      </motion.div>

      {/* Floor Contact Shadow */}
      <motion.div
        animate={
          isCheering
            ? { scaleX: [1, 0.65, 1], opacity: [0.35, 0.15, 0.35] }
            : isBending
            ? { scaleX: [1, 1.2, 1], opacity: [0.35, 0.45, 0.35] }
            : { scaleX: [1, 0.95, 1], opacity: [0.35, 0.3, 0.35] }
        }
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-24 h-3 bg-pink-900/25 rounded-full blur-[2px] -mt-1 pointer-events-none"
      />
    </div>
  );
};
