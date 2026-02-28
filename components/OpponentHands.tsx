'use client';

// ========================
// UNO Minus – Opponent Hands Display
// ========================

import { motion } from 'framer-motion';
import { GamePlayer } from '@/lib/gameTypes';

interface OpponentHandsProps {
  players: GamePlayer[];
  currentTurn: string;
  myId: string;
}

export default function OpponentHands({ players, currentTurn, myId }: OpponentHandsProps) {
  const opponents = players.filter((p) => p.playerId !== myId);

  return (
    <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
      {opponents.map((opponent) => (
        <motion.div
          key={opponent.playerId}
          layout
          className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border transition-all ${
            opponent.playerId === currentTurn
              ? 'bg-yellow-500/10 border-yellow-500/40 shadow-lg shadow-yellow-500/10'
              : 'bg-white/5 border-white/10'
          }`}
        >
          {/* Avatar */}
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                opponent.playerId === currentTurn
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-indigo-500/20 text-indigo-400'
              }`}
            >
              {opponent.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Name */}
          <span className="text-sm font-medium text-white">{opponent.name}</span>

          {/* Card count visualizer */}
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(opponent.cardCount, 10) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="w-3 h-5 rounded-sm bg-linear-to-br from-indigo-700 to-purple-800 border border-indigo-500/30"
              />
            ))}
            {opponent.cardCount > 10 && (
              <span className="text-xs text-gray-400 ml-1">+{opponent.cardCount - 10}</span>
            )}
          </div>

          <span className="text-xs text-gray-500">{opponent.cardCount} cards</span>

          {/* Turn indicator */}
          {opponent.playerId === currentTurn && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs text-yellow-400 font-semibold"
            >
              Playing...
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

