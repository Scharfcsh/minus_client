'use client';

// ========================
// UNO Minus – Player Hand Component
// ========================

import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { Card as CardType } from '@/lib/gameTypes';
import { useGameStore } from '@/store/gameStore';

interface PlayerHandProps {
  cards: CardType[];
  isMyTurn: boolean;
}

export default function PlayerHand({ cards, isMyTurn }: PlayerHandProps) {
  const { selectedCards, toggleCardSelection, gameState } = useGameStore();
  const hasDrawn = gameState?.hasDrawn ?? false;

  // Sort cards by color then value
  const sortedCards = [...cards].sort((a, b) => {
    const colorOrder = { red: 0, blue: 1, green: 2, yellow: 3 };
    const aColor = a.color ? colorOrder[a.color] : 4;
    const bColor = b.color ? colorOrder[b.color] : 4;
    if (aColor !== bColor) return aColor - bColor;
    return a.value - b.value;
  });

  const handValue = cards.reduce((sum, card) => sum + card.value, 0);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Hand value indicator */}
      <motion.div
        layout
        className="flex items-center gap-2 px-4 py-1.5 bg-black/40 backdrop-blur-sm rounded-full border border-white/10"
      >
        <span className="text-sm text-gray-400">Hand Value:</span>
        <motion.span
          key={handValue}
          initial={{ scale: 1.3, color: '#fbbf24' }}
          animate={{ scale: 1, color: '#ffffff' }}
          className="text-lg font-bold text-white"
        >
          {handValue}
        </motion.span>
      </motion.div>

      {/* Cards */}
      <div className="flex items-end justify-center flex-wrap gap-1 sm:gap-2 px-4 max-w-full">
        <AnimatePresence mode="popLayout">
          {sortedCards.map((card, i) => (
            <Card
              key={card.id}
              card={card}
              selected={selectedCards.includes(card.id)}
              onClick={() => toggleCardSelection(card.id)}
              disabled={!isMyTurn || hasDrawn}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
