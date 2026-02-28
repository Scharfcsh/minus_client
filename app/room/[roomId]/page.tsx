'use client';

// ========================
// UNO Minus – Game Room Page
// ========================

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import GameBoard from '@/components/GameBoard';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { gameState, roomId, playerId } = useGameStore();

  useEffect(() => {
    // If no game state, redirect to home
    if (!gameState && !roomId) {
      router.push('/');
    }
  }, [gameState, roomId, router]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-950 via-indigo-950/30 to-gray-950 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading game...</div>
      </div>
    );
  }

  return <GameBoard />;
}
