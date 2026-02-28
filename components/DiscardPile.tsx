'use client';

// ========================
// UNO Minus – Discard Pile Component
// ========================

import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType } from '@/lib/gameTypes';
import Card from './Card';

interface DiscardPileProps {
  topCard: CardType | null;
  canDraw?: boolean;
  onDrawFromDiscard?: () => void;
}

export default function DiscardPile({ topCard, canDraw, onDrawFromDiscard }: DiscardPileProps) {
  if (!topCard) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center">
          <span className="text-gray-600 text-xs text-center">Empty</span>
        </div>
        <span className="text-xs text-gray-400 font-medium">Discard</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className={`relative w-20 h-28 sm:w-24 sm:h-36 ${canDraw ? 'cursor-pointer' : ''}`}
        whileHover={canDraw ? { scale: 1.05 } : {}}
        whileTap={canDraw ? { scale: 0.95 } : {}}
        onClick={canDraw ? onDrawFromDiscard : undefined}
      >
        {/* Shadow */}
        <div className="absolute inset-0 translate-x-1 translate-y-1 opacity-30">
          <div className="w-full h-full rounded-xl bg-gray-600 border-2 border-gray-500" />
        </div>

        {/* Top card */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={topCard.id}
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className="absolute inset-0"
          >
            <Card card={topCard} disabled />
          </motion.div>
        </AnimatePresence>

        {/* Take indicator */}
        {canDraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-xl ring-2 ring-blue-400/60 flex items-end justify-center pb-1"
          >
            <span className="text-[10px] font-bold text-blue-300 bg-black/60 px-1 rounded">TAKE</span>
          </motion.div>
        )}
      </motion.div>
      <span className="text-xs text-gray-400 font-medium">Discard</span>
    </div>
  );
}

