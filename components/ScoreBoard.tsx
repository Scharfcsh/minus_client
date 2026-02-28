'use client';

// ========================
// UNO Minus – ScoreBoard Component
// ========================

import { motion, AnimatePresence } from 'framer-motion';
import { GamePlayer } from '@/lib/gameTypes';

interface ScoreBoardProps {
  players: GamePlayer[];
  currentTurn: string;
  myId: string;
}

export default function ScoreBoard({ players, currentTurn, myId }: ScoreBoardProps) {
  const sortedPlayers = [...players].sort((a, b) => a.score - b.score);

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 w-full max-w-xs">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
        Scoreboard
      </h3>

      <div className="space-y-2">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.playerId}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center justify-between px-3 py-2 rounded-xl
                ${player.playerId === currentTurn ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5'}
                ${player.playerId === myId ? 'ring-1 ring-indigo-500/50' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                {/* Rank */}
                <span className="text-xs text-gray-500 w-4">{index + 1}.</span>

                {/* Name */}
                <span
                  className={`text-sm font-medium ${
                    player.playerId === myId ? 'text-indigo-300' : 'text-white'
                  }`}
                >
                  {player.name}
                  {player.playerId === myId && ' (You)'}
                </span>

                {/* Turn indicator */}
                {player.playerId === currentTurn && (
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-yellow-400 text-xs"
                  >
                    ◄
                  </motion.span>
                )}
              </div>

              {/* Score */}
              <motion.span
                key={player.score}
                initial={{ scale: 1.3, color: '#fbbf24' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-sm font-bold"
              >
                {player.score}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cards remaining */}
      <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs text-gray-500">
        <span>Cards in hand</span>
        <div className="flex gap-2">
          {sortedPlayers.map((p) => (
            <span key={p.playerId} className={p.playerId === myId ? 'text-indigo-400' : 'text-gray-400'}>
              {p.cardCount}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

