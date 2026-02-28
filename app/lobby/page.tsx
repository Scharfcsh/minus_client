'use client';

// ========================
// UNO Minus – Lobby Page
// ========================

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    roomId,
    playerId,
    lobbyPlayers,
    maxPlayers,
    isHost,
    connected,
    initSocket,
    gameState,
    startGame,
  } = useGameStore();

  const name = searchParams.get('name') ?? '';
  const action = searchParams.get('action') ?? '';
  const room = searchParams.get('room') ?? '';
  const maxParam = parseInt(searchParams.get('max') ?? '4', 10);

  const connectAndSetup = useCallback(async () => {
    try {
      setConnecting(true);
      // Register WS event handlers first
      const cleanup = initSocket();

      const store = useGameStore.getState();
      if (action === 'create') {
        await store.createRoom(name, maxParam);
      } else if (action === 'join' && room) {
        await store.joinRoom(room, name);
      }

      setConnecting(false);
      return cleanup;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to connect to game server. Make sure the server is running.'
      );
      setConnecting(false);
    }
  }, [action, name, room, maxParam, initSocket]);

  useEffect(() => {
    if (!name) {
      router.push('/');
      return;
    }

    let cleanup: (() => void) | undefined;
    connectAndSetup().then((c) => {
      cleanup = c;
    });

    return () => {
      cleanup?.();
    };
  }, [name, router, connectAndSetup]);

  // Navigate to game when it starts
  useEffect(() => {
    if (gameState) {
      router.push(`/room/${roomId}`);
    }
  }, [gameState, roomId, router]);

  const handleCopyCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-950 via-indigo-950/30 to-gray-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-950 via-indigo-950/30 to-gray-950 flex flex-col items-center justify-center p-6">
      {/* Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-lg w-full"
      >
        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">Game Lobby</h1>

        {connecting ? (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-gray-400 mt-8"
          >
            Connecting to server...
          </motion.div>
        ) : (
          <>
            {/* Room Code */}
            {roomId && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8"
              >
                <p className="text-sm text-gray-400 mb-2">Room Code</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/15 transition-colors"
                >
                  <span className="text-4xl font-bold text-white tracking-[0.3em]">{roomId}</span>
                  <span className="text-gray-400 text-lg">📋</span>
                </motion.button>
                <p className="text-xs text-gray-500 mt-2">Click to copy</p>
              </motion.div>
            )}

            {/* Players list */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Players ({lobbyPlayers.length}/{maxPlayers})
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {lobbyPlayers.map((player, index) => (
                    <motion.div
                      key={player.playerId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                        player.playerId === playerId
                          ? 'bg-indigo-500/10 border border-indigo-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            player.playerId === playerId
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{player.name}</span>
                        {player.playerId === playerId && (
                          <span className="text-xs text-indigo-400">(You)</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="text-xs text-yellow-400 font-semibold">HOST</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Waiting for players */}
                {lobbyPlayers.length < 2 && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="px-4 py-3 rounded-xl border border-dashed border-gray-700 text-gray-600 text-sm"
                  >
                    Waiting for more players...
                  </motion.div>
                )}
              </div>
            </div>

            {/* Start button (host only) */}
            {isHost && (
              <motion.button
                whileHover={lobbyPlayers.length >= 2 ? { scale: 1.02 } : {}}
                whileTap={lobbyPlayers.length >= 2 ? { scale: 0.98 } : {}}
                onClick={startGame}
                disabled={lobbyPlayers.length < 2}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  lobbyPlayers.length >= 2
                    ? 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-600/30'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                {lobbyPlayers.length >= 2 ? '🎮 Start Game' : `Need ${2 - lobbyPlayers.length} more player(s)`}
              </motion.button>
            )}

            {!isHost && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-gray-400 text-sm"
              >
                Waiting for host to start the game...
              </motion.div>
            )}

            {/* Leave button */}
            <button
              onClick={() => router.push('/')}
              className="mt-6 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Leave Room
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-b from-gray-950 via-indigo-950/30 to-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <LobbyContent />
    </Suspense>
  );
}

