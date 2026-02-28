'use client';

// ========================
// UNO Minus – Main Game Board
// ========================

import { useGameStore } from '@/store/gameStore';
import PlayerHand from './PlayerHand';
import Deck from './Deck';
import DiscardPile from './DiscardPile';
import TurnIndicator from './TurnIndicator';
import ScoreBoard from './ScoreBoard';
import OpponentHands from './OpponentHands';
import ActionButtons from './ActionButtons';
import ShowResultOverlay from './ShowResultOverlay';
import GameOverOverlay from './GameOverOverlay';
import ErrorToast from './ErrorToast';
import { motion } from 'framer-motion';

export default function GameBoard() {
  const {
    gameState,
    myHand,
    showResult,
    setShowResult,
    gameOver,
    isMyTurn,
    drawCard,
    canDraw,
    error,
    playerId,
  } = useGameStore();

  if (!gameState || !playerId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-linear-to-b from-gray-950 via-indigo-950/30 to-gray-950 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Error Toast */}
      <ErrorToast message={error} />

      {/* Top: Opponents */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 pt-4 px-4"
      >
        <OpponentHands
          players={gameState.players}
          currentTurn={gameState.currentTurn}
          myId={playerId}
        />
      </motion.div>

      {/* Middle: Game area */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="flex items-center gap-4 sm:gap-12">
          {/* Scoreboard (left side on larger screens) */}
          <div className="hidden lg:block">
            <ScoreBoard
              players={gameState.players}
              currentTurn={gameState.currentTurn}
              myId={playerId}
            />
          </div>

          {/* Center: Discard pile + Deck */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 sm:gap-10">
              <DiscardPile
                topCard={gameState.discardTop}
                canDraw={canDraw() && gameState.discardTop !== null}
                onDrawFromDiscard={() => drawCard('discard')}
              />
              <Deck
                cardsRemaining={gameState.deckCount}
                canDraw={canDraw()}
                onDraw={() => drawCard('deck')}
              />
            </div>

            {/* Turn indicator */}
            <TurnIndicator
              currentTurn={gameState.currentTurn}
              players={gameState.players}
              myId={playerId}
              direction={gameState.direction}
              hasPlayed={gameState.hasPlayed}
              hasDrawn={gameState.hasDrawn}
            />

            {/* Action buttons */}
            <ActionButtons />
          </div>

          {/* Mobile scoreboard */}
          <div className="lg:hidden">
            <ScoreBoard
              players={gameState.players}
              currentTurn={gameState.currentTurn}
              myId={playerId}
            />
          </div>
        </div>
      </div>

      {/* Bottom: My hand */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 pb-6 px-2"
      >
        <PlayerHand cards={myHand} isMyTurn={isMyTurn()} />
      </motion.div>

      {/* Overlays */}
      <ShowResultOverlay result={showResult} onDismiss={() => setShowResult(null)} />

      {gameOver && (
        <GameOverOverlay
          winner={gameOver.winner}
          finalScores={gameOver.finalScores}
          myId={playerId}
          onPlayAgain={() => window.location.reload()}
          onLeave={() => (window.location.href = '/')}
        />
      )}
    </div>
  );
}

