'use client';

// ========================
// UNO Minus – Turn Indicator
// ========================

import { motion, AnimatePresence } from 'framer-motion';
import { GamePlayer } from '@/lib/gameTypes';

interface TurnIndicatorProps {
  currentTurn: string;
  players: GamePlayer[];
  myId: string;
  direction: 'clockwise' | 'counterclockwise';
  hasPlayed: boolean;
  hasDrawn: boolean;
}

export default function TurnIndicator({
  currentTurn,
  players,
  myId,
  direction,
  hasPlayed,
  hasDrawn,
}: TurnIndicatorProps) {
  const currentPlayer = players.find((p) => p.playerId === currentTurn);
  const isMyTurn = currentTurn === myId;

  return (
    <motion.div
      layout
      className="flex items-center gap-4 px-6 py-3 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10"
    >
      {/* Direction arrow */}
      <motion.div
        animate={{ rotate: direction === 'clockwise' ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-2xl"
      >
        ➡️
      </motion.div>

      {/* Current player name */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTurn}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex flex-col"
        >
          <span className="text-xs text-gray-400 uppercase tracking-wider">Current Turn</span>
          <span className={`text-lg font-bold ${isMyTurn ? 'text-yellow-400' : 'text-white'}`}>
            {isMyTurn ? '🎯 Your Turn!' : currentPlayer?.name ?? 'Unknown'}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Turn progress indicators */}
      <div className="flex gap-2 ml-4">
        <motion.div
          animate={{ opacity: hasPlayed ? 0.4 : 1, scale: hasPlayed ? 0.9 : 1 }}
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            hasPlayed
              ? 'bg-green-500/20 text-green-400 line-through'
              : 'bg-orange-500/20 text-orange-400'
          }`}
        >
          Play
        </motion.div>
        <motion.div
          animate={{ opacity: hasDrawn ? 0.4 : 1, scale: hasDrawn ? 0.9 : 1 }}
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            hasDrawn
              ? 'bg-green-500/20 text-green-400 line-through'
              : hasPlayed
              ? 'bg-orange-500/20 text-orange-400'
              : 'bg-gray-500/20 text-gray-500'
          }`}
        >
          Draw
        </motion.div>
      </div>
    </motion.div>
  );
}

