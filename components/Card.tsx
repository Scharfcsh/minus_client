'use client';

// ========================
// UNO Minus – Card Component
// ========================

import { motion } from 'framer-motion';
import { Card as CardType } from '@/lib/gameTypes';

interface CardProps {
  card: CardType;
  selected?: boolean;
  faceDown?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  index?: number;
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  red: { bg: 'bg-red-500', border: 'border-red-700', text: 'text-white' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-700', text: 'text-white' },
  green: { bg: 'bg-green-500', border: 'border-green-700', text: 'text-white' },
  yellow: { bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-gray-900' },
};

const TYPE_LABELS: Record<string, string> = {
  skip: '⊘',
  reverse: '⟲',
  wild: '★',
  draw2: '+2',
  wild4: '+4',
  number: '',
};

export default function Card({
  card,
  selected = false,
  faceDown = false,
  onClick,
  disabled = false,
  small = false,
  index = 0,
}: CardProps) {
  const colors = card.color ? COLOR_MAP[card.color] : { bg: 'bg-gray-800', border: 'border-gray-900', text: 'text-white' };
  const size = small ? 'w-14 h-20 text-xs' : 'w-20 h-28 sm:w-24 sm:h-36 text-sm';

  if (faceDown) {
    return (
      <motion.div
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
        className={`${size} rounded-xl border-2 border-gray-600 bg-linear-to-br from-indigo-900 via-purple-900 to-indigo-900 flex items-center justify-center shadow-lg cursor-default`}
      >
        <div className="text-2xl opacity-30">🎴</div>
      </motion.div>
    );
  }

  return (
    <motion.button
      layout
      initial={{ scale: 0, rotateY: 180 }}
      animate={{
        scale: 1,
        rotateY: 0,
        y: selected ? -16 : 0,
      }}
      exit={{ scale: 0, rotateY: 180 }}
      whileHover={!disabled ? { y: -8, scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: index * 0.03 }}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        ${size} rounded-xl border-2 ${colors.border} ${colors.bg} ${colors.text}
        flex flex-col items-center justify-center gap-1
        shadow-lg relative overflow-hidden
        ${selected ? 'ring-4 ring-white ring-opacity-80 shadow-2xl' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
        transition-shadow
      `}
    >
      {/* Top-left value */}
      <span className="absolute top-1 left-1.5 font-bold text-[10px] sm:text-xs opacity-80">
        {card.type === 'number' ? card.value : TYPE_LABELS[card.type]}
      </span>

      {/* Center */}
      <div className="font-extrabold text-xl sm:text-3xl drop-shadow-md">
        {card.type === 'number' ? card.value : TYPE_LABELS[card.type]}
      </div>

      {/* Card type label */}
      {card.type !== 'number' && (
        <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wide opacity-70">
          {card.type}
        </span>
      )}

      {/* Bottom-right value */}
      <span className="absolute bottom-1 right-1.5 font-bold text-[10px] sm:text-xs opacity-80 rotate-180">
        {card.type === 'number' ? card.value : TYPE_LABELS[card.type]}
      </span>

      {/* Shine overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
    </motion.button>
  );
}
