// ========================
// UNO Minus – Client Game Store (Zustand)
// ========================

import { create } from 'zustand';
import { ClientGameState, GamePlayer, LobbyPlayer, Card, ShowResult } from '@/lib/gameTypes';
import { gameSocket } from '@/lib/socket';
import { createRoom as apiCreateRoom, joinRoom as apiJoinRoom } from '@/lib/api';

interface GameStore {
  // Connection state
  connected: boolean;
  error: string | null;

  // Lobby state
  roomId: string | null;
  playerId: string | null;
  playerName: string | null;
  isHost: boolean;
  maxPlayers: number;
  lobbyPlayers: LobbyPlayer[];

  // Game state (built incrementally from WS events)
  gameState: ClientGameState | null;
  myHand: Card[];
  selectedCards: string[];
  showResult: ShowResult | null;
  gameOver: {
    winner: { playerId: string; name: string };
    finalScores: Array<{ playerId: string; name: string; totalScore: number }>;
  } | null;

  // Derived helpers
  isMyTurn: () => boolean;
  canPlay: () => boolean;
  canDraw: () => boolean;
  canEndTurn: () => boolean;
  canCallShow: () => boolean;
  getMyHandValue: () => number;

  // Actions
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  setShowResult: (result: ShowResult | null) => void;
  setGameOver: (
    data: { winner: { playerId: string; name: string }; finalScores: Array<{ playerId: string; name: string; totalScore: number }> } | null
  ) => void;
  toggleCardSelection: (cardId: string) => void;
  clearSelection: () => void;
  reset: () => void;

  // Game actions (HTTP + WS)
  createRoom: (playerName: string, maxPlayers: number) => Promise<void>;
  joinRoom: (roomId: string, playerName: string) => Promise<void>;
  startGame: () => void;
  playCards: () => void;
  drawCard: (source: 'deck' | 'discard') => void;
  callShow: () => void;
  endTurn: () => void;

  // Socket event listener setup
  initSocket: () => () => void;
}

const initialState = {
  connected: false,
  error: null,
  roomId: null,
  playerId: null,
  playerName: null,
  isHost: false,
  maxPlayers: 4,
  lobbyPlayers: [] as LobbyPlayer[],
  gameState: null,
  myHand: [] as Card[],
  selectedCards: [] as string[],
  showResult: null,
  gameOver: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // Derived helpers
  isMyTurn: () => {
    const { gameState, playerId } = get();
    return gameState?.currentTurn === playerId;
  },

  canPlay: () => {
    const { gameState, playerId, selectedCards } = get();
    if (!gameState || gameState.currentTurn !== playerId) return false;
    if (gameState.hasDrawn) return false;
    return selectedCards.length > 0;
  },

  canDraw: () => {
    const { gameState, playerId } = get();
    if (!gameState || gameState.currentTurn !== playerId) return false;
    return gameState.hasPlayed && !gameState.hasDrawn;
  },

  canEndTurn: () => {
    const { gameState, playerId } = get();
    if (!gameState || gameState.currentTurn !== playerId) return false;
    return gameState.hasPlayed && gameState.hasDrawn;
  },

  canCallShow: () => {
    const { gameState, playerId } = get();
    if (!gameState || gameState.currentTurn !== playerId) return false;
    return true;
  },

  getMyHandValue: () => {
    const { myHand } = get();
    return myHand.reduce((sum, card) => sum + card.value, 0);
  },

  // Setters
  setConnected: (connected) => set({ connected }),
  setError: (error) => set({ error }),
  setShowResult: (result) => set({ showResult: result }),
  setGameOver: (data) => set({ gameOver: data }),

  toggleCardSelection: (cardId) =>
    set((state) => {
      const isSelected = state.selectedCards.includes(cardId);
      if (isSelected) {
        return { selectedCards: state.selectedCards.filter((id) => id !== cardId) };
      }

      const currentCard = state.myHand.find((c) => c.id === cardId);
      if (!currentCard) return state;

      if (state.selectedCards.length > 0) {
        const firstSelected = state.myHand.find((c) => c.id === state.selectedCards[0]);
        if (
          firstSelected &&
          (currentCard.type !== firstSelected.type ||
            currentCard.color !== firstSelected.color ||
            currentCard.value !== firstSelected.value)
        ) {
          return { selectedCards: [cardId] };
        }
      }

      return { selectedCards: [...state.selectedCards, cardId] };
    }),

  clearSelection: () => set({ selectedCards: [] }),
  reset: () => set(initialState),

  // ========================
  // Game actions
  // ========================

  createRoom: async (playerName, maxPlayers) => {
    set({ playerName, isHost: true, maxPlayers });
    const data = await apiCreateRoom(playerName, maxPlayers);
    const lobbyMe: LobbyPlayer = { playerId: data.playerId, name: playerName };
    set({ roomId: data.roomId, playerId: data.playerId, lobbyPlayers: [lobbyMe] });
    await gameSocket.connect(data.roomId, data.playerId);
    set({ connected: true });
  },

  joinRoom: async (roomId, playerName) => {
    set({ playerName, isHost: false });
    const data = await apiJoinRoom(roomId, playerName);
    set({
      roomId: data.roomId,
      playerId: data.playerId,
      lobbyPlayers: data.players,
    });
    await gameSocket.connect(data.roomId, data.playerId);
    set({ connected: true });
  },

  startGame: () => {
    gameSocket.startGame();
  },

  playCards: () => {
    const { selectedCards } = get();
    if (selectedCards.length > 0) {
      gameSocket.playCards(selectedCards);
      set({ selectedCards: [] });
    }
  },

  drawCard: (source) => {
    gameSocket.drawCard(source);
  },

  callShow: () => {
    gameSocket.callShow();
  },

  endTurn: () => {
    gameSocket.endTurn();
  },

  // ========================
  // Socket event handling
  // ========================
  initSocket: () => {
    const unsubscribe = gameSocket.onEvent((event) => {
      const { playerId, lobbyPlayers, gameState } = get();

      switch (event.type) {
        case 'PLAYER_JOINED': {
          // Add new player to lobby list if not already present
          const exists = lobbyPlayers.some((p) => p.playerId === event.payload.playerId);
          if (!exists) {
            set({
              lobbyPlayers: [
                ...lobbyPlayers,
                { playerId: event.payload.playerId, name: event.payload.name },
              ],
            });
          }
          break;
        }

        case 'PLAYER_LEFT': {
          set({
            lobbyPlayers: lobbyPlayers.filter((p) => p.playerId !== event.payload.playerId),
          });
          break;
        }

        case 'GAME_STARTED': {
          const { hand, discardTop, deckCount, currentTurn, players } = event.payload;
          const gamePlayers: GamePlayer[] = players.map((p) => ({
            playerId: p.playerId,
            name: p.name,
            cardCount: p.cardCount,
            score: 0,
          }));
          const newGameState: ClientGameState = {
            currentTurn,
            discardTop,
            deckCount,
            players: gamePlayers,
            direction: 'clockwise',
            hasPlayed: false,
            hasDrawn: false,
          };
          set({ gameState: newGameState, myHand: hand });
          break;
        }

        case 'CARD_PLAYED': {
          if (!gameState) break;
          const { playerId: actingPlayer, cards, discardTop } = event.payload;
          // Update the acting player's card count and the discard top
          const updatedPlayers = gameState.players.map((p) =>
            p.playerId === actingPlayer
              ? { ...p, cardCount: Math.max(0, p.cardCount - cards.length) }
              : p
          );
          const isMyPlay = actingPlayer === playerId;
          set({
            gameState: {
              ...gameState,
              discardTop,
              players: updatedPlayers,
              hasPlayed: isMyPlay ? true : gameState.hasPlayed,
            },
            // Remove played cards from my hand if it was my turn
            myHand: isMyPlay
              ? get().myHand.filter((c) => !cards.some((pc) => pc.id === c.id))
              : get().myHand,
          });
          break;
        }

        case 'CARD_DRAWN': {
          // Private to drawing player only
          if (!gameState) break;
          set({
            gameState: { ...gameState, hasDrawn: true },
            myHand: [...get().myHand, event.payload.card],
          });
          break;
        }

        case 'CARD_DRAWN_BROADCAST': {
          if (!gameState) break;
          const { playerId: actingPlayer, cardCount, discardTop: newDiscardTop } = event.payload;
          const updatedPlayers = gameState.players.map((p) =>
            p.playerId === actingPlayer ? { ...p, cardCount } : p
          );
          set({
            gameState: {
              ...gameState,
              players: updatedPlayers,
              discardTop:
                event.payload.discardTop !== undefined
                  ? newDiscardTop
                  : gameState.discardTop,
            },
          });
          break;
        }

        case 'TURN_CHANGED': {
          if (!gameState) break;
          set({
            gameState: {
              ...gameState,
              currentTurn: event.payload.currentTurn,
              hasPlayed: false,
              hasDrawn: false,
            },
            selectedCards: [],
          });
          break;
        }

        case 'SHOW_RESULT': {
          // Update scores from result
          if (gameState) {
            const scoreMap = new Map(
              event.payload.scores.map((s) => [s.playerId, s.totalScore])
            );
            const updatedPlayers = gameState.players.map((p) => ({
              ...p,
              score: scoreMap.get(p.playerId) ?? p.score,
            }));
            set({ gameState: { ...gameState, players: updatedPlayers } });
          }
          set({ showResult: event.payload });
          break;
        }

        case 'GAME_OVER': {
          set({
            gameOver: {
              winner: event.payload.winner,
              finalScores: event.payload.finalScores,
            },
          });
          break;
        }

        case 'ERROR': {
          set({ error: event.payload.message });
          setTimeout(() => set({ error: null }), 4000);
          break;
        }
      }
    });

    return () => {
      unsubscribe();
      gameSocket.disconnect();
    };
  },
}));
