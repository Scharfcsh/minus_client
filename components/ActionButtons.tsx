'use client';

// ========================
// UNO Minus – Action Buttons
// ========================

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export default function ActionButtons() {
  const {
    playCards,
    drawCard,
    endTurn,
    callShow,
    canPlay,
    canDraw,
    canEndTurn,
    canCallShow,
    selectedCards,
    isMyTurn,
    gameState,
  } = useGameStore();

  if (!gameState) return null;

  const myTurn = isMyTurn();
  const showCanPlay = canPlay();
  const showCanDraw = canDraw();
  const showCanEndTurn = canEndTurn();
  const showCanShow = canCallShow();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-center gap-3"
    >
      {/* Play Cards button */}
      <motion.button
        whileHover={showCanPlay ? { scale: 1.05 } : {}}
        whileTap={showCanPlay ? { scale: 0.95 } : {}}
        onClick={playCards}
        disabled={!showCanPlay}
        className={`
          px-6 py-3 rounded-xl font-semibold text-sm transition-all
          ${showCanPlay
            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        Play {selectedCards.length > 0 ? `(${selectedCards.length})` : ''}
      </motion.button>

      {/* Draw from Deck button */}
      <motion.button
        whileHover={showCanDraw ? { scale: 1.05 } : {}}
        whileTap={showCanDraw ? { scale: 0.95 } : {}}
        onClick={() => drawCard('deck')}
        disabled={!showCanDraw}
        className={`
          px-6 py-3 rounded-xl font-semibold text-sm transition-all
          ${showCanDraw
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        Draw from Deck
      </motion.button>

      {/* End Turn button */}
      <motion.button
        whileHover={showCanEndTurn ? { scale: 1.05 } : {}}
        whileTap={showCanEndTurn ? { scale: 0.95 } : {}}
        onClick={endTurn}
        disabled={!showCanEndTurn}
        className={`
          px-6 py-3 rounded-xl font-semibold text-sm transition-all
          ${showCanEndTurn
            ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        End Turn
      </motion.button>

      {/* SHOW button */}
      <motion.button
        whileHover={showCanShow ? { scale: 1.05 } : {}}
        whileTap={showCanShow ? { scale: 0.95 } : {}}
        onClick={callShow}
        disabled={!showCanShow}
        className={`
          px-6 py-3 rounded-xl font-bold text-sm transition-all
          ${showCanShow
            ? 'bg-linear-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-lg shadow-red-600/30 animate-pulse'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        🔥 SHOW
      </motion.button>

      {/* Not your turn overlay */}
      {!myTurn && (
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-gray-400 ml-2"
        >
          Waiting for opponent...
        </motion.span>
      )}
    </motion.div>
  );
}

