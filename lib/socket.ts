// ========================
// UNO Minus – WebSocket Client
// ========================

import { ClientEvent, ServerEvent } from './gameTypes';

type EventHandler = (event: ServerEvent) => void;

const BASE_WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000';

class GameSocket {
  private ws: WebSocket | null = null;
  private handlers: Set<EventHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private url: string = '';
  private _isConnected = false;

  get isConnected(): boolean {
    return this._isConnected;
  }

  // Connect with roomId + playerId as required query params
  connect(roomId: string, playerId: string): Promise<void> {
    this.url = `${BASE_WS_URL}/ws?roomId=${encodeURIComponent(roomId)}&playerId=${encodeURIComponent(playerId)}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('Connected to game server');
          this._isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const serverEvent: ServerEvent = JSON.parse(event.data);
            this.handlers.forEach((handler) => handler(serverEvent));
          } catch (e) {
            console.error('Failed to parse server message:', e);
          }
        };

        this.ws.onclose = () => {
          console.log('Disconnected from game server');
          this._isConnected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this._isConnected = false;
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

    setTimeout(() => {
      // Re-connect using stored URL directly
      try {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
          this._isConnected = true;
          this.reconnectAttempts = 0;
        };
        this.ws.onmessage = (event) => {
          try {
            const serverEvent: ServerEvent = JSON.parse(event.data);
            this.handlers.forEach((handler) => handler(serverEvent));
          } catch { /* ignore */ }
        };
        this.ws.onclose = () => {
          this._isConnected = false;
          this.attemptReconnect();
        };
        this.ws.onerror = () => {
          this._isConnected = false;
        };
      } catch { /* ignore */ }
    }, delay);
  }

  send(event: ClientEvent): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.error('WebSocket not connected');
    }
  }

  onEvent(handler: EventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  disconnect(): void {
    this.maxReconnectAttempts = 0; // Prevent reconnect
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._isConnected = false;
  }

  // ========================
  // Helper methods for game actions
  // ========================

  startGame(): void {
    this.send({ type: 'START_GAME', payload: {} });
  }

  playCards(cardIds: string[]): void {
    this.send({ type: 'PLAY_CARD', payload: { cardIds } });
  }

  drawCard(source: 'deck' | 'discard'): void {
    this.send({ type: 'DRAW_CARD', payload: { source } });
  }

  callShow(): void {
    this.send({ type: 'CALL_SHOW', payload: {} });
  }

  endTurn(): void {
    this.send({ type: 'END_TURN', payload: {} });
  }
}

// Singleton instance
export const gameSocket = new GameSocket();
