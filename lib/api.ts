// ========================
// UNO Minus – HTTP API Client
// ========================

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error ?? 'Unknown error');
  }
  return json.data as T;
}

export interface CreateRoomResult {
  roomId: string;
  playerId: string;
  status: string;
}

export interface JoinRoomResult {
  playerId: string;
  roomId: string;
  players: Array<{ playerId: string; name: string }>;
  status: string;
}

export function createRoom(playerName: string, maxPlayers: number): Promise<CreateRoomResult> {
  return apiFetch<CreateRoomResult>('/room/create', {
    method: 'POST',
    body: JSON.stringify({ playerName, maxPlayers }),
  });
}

export function joinRoom(roomId: string, playerName: string): Promise<JoinRoomResult> {
  return apiFetch<JoinRoomResult>('/room/join', {
    method: 'POST',
    body: JSON.stringify({ roomId, playerName }),
  });
}
