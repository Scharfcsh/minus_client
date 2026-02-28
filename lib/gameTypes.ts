// ========================
// UNO Minus – Client Game Types (aligned to endpoints.md)
// ========================

export type CardColor = 'red' | 'blue' | 'green' | 'yellow';
export type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export interface Card {
  id: string;
  type: CardType;
  color: CardColor | null;
  value: number;
}

// Player shape used during gameplay
export interface GamePlayer {
  playerId: string;
  name: string;
  cardCount: number;
  score: number;
}

// Player shape used during lobby
export interface LobbyPlayer {
  playerId: string;
  name: string;
}

// Client-side game state (built incrementally from WS events)
export interface ClientGameState {
  currentTurn: string;
  discardTop: Card | null;
  deckCount: number;
  players: GamePlayer[];
  direction: 'clockwise' | 'counterclockwise';
  hasPlayed: boolean;
  hasDrawn: boolean;
}

// SHOW_RESULT payload shape
export interface ShowResult {
  callerId: string;
  callerWon: boolean;
  hands: Array<{
    playerId: string;
    name: string;
    hand: Card[];
    handValue: number;
    penalty: number;
    scoreAdded: number;
  }>;
  roundWinner: { playerId: string; name: string };
  scores: Array<{ playerId: string; name: string; totalScore: number }>;
}

// ========================
// Client → Server WebSocket events
// ========================
export type ClientEvent =
  | { type: 'START_GAME'; payload: Record<string, never> }
  | { type: 'PLAY_CARD'; payload: { cardIds: string[] } }
  | { type: 'DRAW_CARD'; payload: { source: 'deck' | 'discard' } }
  | { type: 'CALL_SHOW'; payload: Record<string, never> }
  | { type: 'END_TURN'; payload: Record<string, never> };

// ========================
// Server → Client WebSocket events
// ========================
export type ServerEvent =
  | { type: 'PLAYER_JOINED'; payload: { playerId: string; name: string; playerCount: number } }
  | { type: 'PLAYER_LEFT'; payload: { playerId: string; name: string } }
  | {
      type: 'GAME_STARTED';
      payload: {
        hand: Card[];
        discardTop: Card | null;
        deckCount: number;
        currentTurn: string;
        players: Array<{ playerId: string; name: string; cardCount: number }>;
      };
    }
  | { type: 'CARD_PLAYED'; payload: { playerId: string; cards: Card[]; discardTop: Card } }
  | { type: 'CARD_DRAWN'; payload: { card: Card; source: 'deck' | 'discard' } }
  | {
      type: 'CARD_DRAWN_BROADCAST';
      payload: {
        playerId: string;
        source: 'deck' | 'discard';
        cardCount: number;
        discardTop: Card | null;
      };
    }
  | { type: 'TURN_CHANGED'; payload: { currentTurn: string } }
  | { type: 'SHOW_RESULT'; payload: ShowResult }
  | {
      type: 'GAME_OVER';
      payload: {
        winner: { playerId: string; name: string };
        finalScores: Array<{ playerId: string; name: string; totalScore: number }>;
      };
    }
  | { type: 'ERROR'; payload: { code: string; message: string } };
