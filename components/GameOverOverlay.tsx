'use client';

// ========================
// UNO Minus – Game Over Overlay
// ========================

import { motion } from 'framer-motion';

interface GameOverOverlayProps {
  winner: { playerId: string; name: string };
  finalScores: Array<{ playerId: string; name: string; totalScore: number }>;
  myId: string;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export default function GameOverOverlay({
  winner,
  finalScores,
  myId,
  onPlayAgain,
  onLeave,
}: GameOverOverlayProps) {
  const sorted = [...finalScores].sort((a, b) => a.totalScore - b.totalScore);
  const isWinner = winner.playerId === myId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-linear-to-b from-gray-900 to-gray-950 border border-white/20 rounded-3xl p-8 max-w-md w-full text-center"
      >
        {/* Trophy */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-1">Game Over!</h2>
        <p className="text-lg text-gray-400 mb-6">
          {isWinner ? 'You win! 🎊' : `${winner.name} wins!`}
        </p>

        {/* Final rankings */}
        <div className="space-y-2 mb-8">
          {sorted.map((player, index) => (
            <motion.div
              key={player.playerId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                index === 0
                  ? 'bg-yellow-500/10 border border-yellow-500/30'
                  : 'bg-white/5'
              } ${player.playerId === myId ? 'ring-1 ring-indigo-500/50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <span className="text-white font-medium">
                  {player.name}
                  {player.playerId === myId && ' (You)'}
                </span>
              </div>
              <span className="text-lg font-bold text-white">{player.totalScore}</span>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLeave}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
          >
            Leave
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
          >
            Play Again
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

