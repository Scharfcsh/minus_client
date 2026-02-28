'use client';

// ========================
// UNO Minus – Home / Landing Page
// ========================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [maxPlayers, setMaxPlayers] = useState(4);

  const handleCreate = () => {
    if (!playerName.trim()) return;
    const params = new URLSearchParams({ name: playerName.trim(), action: 'create', max: String(maxPlayers) });
    router.push(`/lobby?${params.toString()}`);
  };

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    const params = new URLSearchParams({ name: playerName.trim(), action: 'join', room: roomCode.trim().toUpperCase() });
    router.push(`/lobby?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 via-indigo-950/40 to-gray-950 flex flex-col items-center justify-center p-6">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-md w-full"
      >
        {/* Logo / Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-extrabold bg-linear-to-r from-red-500 via-green-400 to-blue-500 bg-clip-text text-transparent">
            UNO
          </h1>
          <h2 className="text-4xl font-bold text-white mt-1">Minus</h2>
          <p className="text-gray-400 mt-3 text-sm">
            Minimize your hand. Outsmart your opponents.
          </p>
        </motion.div>

        {/* Card decorations */}
        <div className="flex justify-center gap-2 mb-10">
          {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-400'].map((color, i) => (
            <motion.div
              key={color}
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: (i - 1.5) * 8, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
              className={`w-12 h-18 ${color} rounded-lg shadow-xl border-2 border-white/20 flex items-center justify-center`}
            >
              <span className="text-white font-bold text-lg">{[7, 2, 0, 5][i]}</span>
            </motion.div>
          ))}
        </div>

        {/* Menu */}
        {mode === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            {/* Name input */}
            <div>
              <input
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => playerName.trim() && setMode('create')}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
                  playerName.trim()
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!playerName.trim()}
              >
                Create Room
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => playerName.trim() && setMode('join')}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg transition-all ${
                  playerName.trim()
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
                disabled={!playerName.trim()}
              >
                Join Room
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Create mode - just proceed */}
        {mode === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-gray-300">
              Creating room as <span className="font-bold text-white">{playerName}</span>
            </p>

            <div>
              <p className="text-sm text-gray-400 mb-2">Max players</p>
              <div className="flex gap-2 justify-center">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setMaxPlayers(n)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      maxPlayers === n
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-white/10 text-gray-300 hover:bg-white/15'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreate}
              className="w-full py-4 rounded-xl font-semibold text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              🎮 Create Game
            </motion.button>

            <button
              onClick={() => setMode('menu')}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {/* Join mode */}
        {mode === 'join' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="text-gray-300">
              Joining as <span className="font-bold text-white">{playerName}</span>
            </p>

            <input
              type="text"
              placeholder="Enter room code..."
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500 text-center text-2xl font-bold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all uppercase"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={!roomCode.trim()}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                roomCode.trim()
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/30'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              🚀 Join Game
            </motion.button>

            <button
              onClick={() => setMode('menu')}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              ← Back
            </button>
          </motion.div>
        )}

        {/* Rules summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-left bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            How to Play
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex gap-2">
              <span>🎯</span>
              <span>Goal: Have the <strong className="text-white">lowest hand value</strong> when someone calls SHOW</span>
            </li>
            <li className="flex gap-2">
              <span>🃏</span>
              <span>Each turn: Play card(s) → Draw one card → End turn</span>
            </li>
            <li className="flex gap-2">
              <span>📚</span>
              <span>Stack identical cards to play multiple in one turn</span>
            </li>
            <li className="flex gap-2">
              <span>🔥</span>
              <span>Call <strong className="text-red-400">SHOW</strong> when you think you have the lowest hand</span>
            </li>
            <li className="flex gap-2">
              <span>⚠️</span>
              <span>Wrong SHOW = +25 penalty points!</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
