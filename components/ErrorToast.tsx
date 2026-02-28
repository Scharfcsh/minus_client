'use client';

// ========================
// UNO Minus – Error Toast
// ========================

import { motion, AnimatePresence } from 'framer-motion';

interface ErrorToastProps {
  message: string | null;
}

export default function ErrorToast({ message }: ErrorToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-4 left-1/2 z-100 px-6 py-3 bg-red-600/90 backdrop-blur-sm text-white font-medium rounded-xl shadow-lg border border-red-500/50"
        >
          ⚠️ {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
