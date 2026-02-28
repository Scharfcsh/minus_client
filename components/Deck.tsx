'use client';

// ========================
// UNO Minus – Deck Component
// ========================

import { motion } from 'framer-motion';

interface DeckProps {
  cardsRemaining: number;
  canDraw: boolean;
  onDraw: () => void;
}

export default function Deck({ cardsRemaining, canDraw, onDraw }: DeckProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        whileHover={canDraw ? { scale: 1.08, rotate: 2 } : {}}
        whileTap={canDraw ? { scale: 0.95 } : {}}
        onClick={canDraw ? onDraw : undefined}
        disabled={!canDraw}
        className={`
          w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 
          ${canDraw
            ? 'border-indigo-400 bg-linear-to-br from-indigo-800 via-purple-800 to-indigo-900 cursor-pointer hover:shadow-indigo-500/50 hover:shadow-xl'
            : 'border-gray-600 bg-linear-to-br from-gray-800 via-gray-700 to-gray-800 cursor-not-allowed opacity-60'
          }
          flex flex-col items-center justify-center gap-1 shadow-lg relative overflow-hidden
          transition-shadow
        `}
      >
        <div className="text-3xl">🎴</div>
        <span className="text-xs font-semibold text-gray-300">DRAW</span>

        {/* Shine effect */}
        {canDraw && (
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: [-200, 200] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
        )}
      </motion.button>

      <span className="text-xs text-gray-400 font-medium">{cardsRemaining} left</span>
    </div>
  );
}
