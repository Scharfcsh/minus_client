'use client';

// ========================
// UNO Minus – Show Result Overlay
// ========================

import { motion, AnimatePresence } from 'framer-motion';
import { ShowResult } from '@/lib/gameTypes';
import Card from './Card';

interface ShowResultOverlayProps {
  result: ShowResult | null;
  onDismiss: () => void;
}

export default function ShowResultOverlay({ result, onDismiss }: ShowResultOverlayProps) {
  if (!result) return null;

  const callerHand = result.hands.find((h) => h.playerId === result.callerId);
  const callerName = callerHand?.name ?? 'Unknown';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="bg-gray-900 border border-white/20 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-6"
          >
            <div className="text-4xl mb-2">
              {result.callerWon ? '🎉' : '💥'}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {callerName} called SHOW!
            </h2>
            <p
              className={`text-lg font-semibold mt-1 ${
                result.callerWon ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {result.callerWon
                ? '✅ Correct! Lowest hand value!'
                : `❌ Wrong! ${callerName} gets +25 penalty!`}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Round winner: <span className="text-yellow-400 font-semibold">{result.roundWinner.name}</span>
            </p>
          </motion.div>

          {/* All hands revealed */}
          <div className="space-y-4">
            {result.hands
              .sort((a, b) => a.handValue - b.handValue)
              .map((playerHand, index) => (
                <motion.div
                  key={playerHand.playerId}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`p-4 rounded-xl border ${
                    playerHand.playerId === result.callerId
                      ? result.callerWon
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">
                      {playerHand.name}
                      {playerHand.playerId === result.callerId && ' 📢'}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-yellow-400">
                        {playerHand.handValue}
                      </span>
                      {playerHand.penalty > 0 && (
                        <span className="text-sm text-red-400">+{playerHand.penalty} penalty</span>
                      )}
                      <span className="text-sm text-gray-400">+{playerHand.scoreAdded} pts</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {playerHand.hand.map((card, cardIdx) => (
                      <Card
                        key={card.id}
                        card={card}
                        small
                        disabled
                        index={cardIdx}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Dismiss button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDismiss}
            className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

