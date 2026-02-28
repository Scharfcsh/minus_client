# UNO Minus — Frontend Integration Guide

## Base URLs

```
HTTP:      http://localhost:3000
WebSocket: ws://localhost:3000/ws?roomId=ROOM_ID&playerId=PLAYER_ID
```

---

## Common Shapes

**HTTP success**
```json
{ "success": true, "data": { ... } }
```

**HTTP error**
```json
{ "success": false, "error": "message" }
```

**WebSocket message**
```json
{ "type": "EVENT_NAME", "payload": { ... } }
```

**Card object**
```json
{
  "id":    "red-7-1",
  "color": "red",
  "type":  "number",
  "value": 7
}
```

| Field   | Values |
|---------|--------|
| `color` | `"red"` \| `"blue"` \| `"green"` \| `"yellow"` \| `null` (Wild / Wild Draw 4) |
| `type`  | `"number"` \| `"skip"` \| `"reverse"` \| `"draw2"` \| `"wild"` \| `"wild4"` |
| `value` | Number 0–9 = face value · Skip = 10 · Reverse = 12 · Draw 2 = 2 · Wild = 0 · Wild Draw 4 = 4 |

---

## HTTP Endpoints

### `GET /health`

Health check.

**Response `200`**
```json
{ "status": "healthy" }
```

---

### `POST /room/create`

Create a new room. The caller becomes the host.

**Request body**
```json
{
  "playerName": "Alice",
  "maxPlayers": 4
}
```

| Field        | Type   | Rules |
|--------------|--------|-------|
| `playerName` | string | required |
| `maxPlayers` | number | 2–6 inclusive |

**Response `201`**
```json
{
  "success": true,
  "data": {
    "roomId":   "ABC123",
    "playerId": "uuid-host",
    "status":   "waiting"
  }
}
```

> Save `playerId` — it is required for the WebSocket connection and all future actions.

**Error responses**

| Status | `error` |
|--------|---------|
| `400`  | `"playerName is required"` |
| `400`  | `"maxPlayers must be between 2 and 6"` |

---

### `POST /room/join`

Join an existing room using the room code.

**Request body**
```json
{
  "roomId":     "ABC123",
  "playerName": "Bob"
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "playerId": "uuid-bob",
    "roomId":   "ABC123",
    "players": [
      { "playerId": "uuid-host", "name": "Alice" },
      { "playerId": "uuid-bob",  "name": "Bob" }
    ],
    "status": "waiting"
  }
}
```

> Save the returned `playerId` — same requirement as create.

**Error responses**

| Status | `error` |
|--------|---------|
| `404`  | `"Room not found"` |
| `400`  | `"Game already in progress"` |
| `400`  | `"Room is full"` |

---

### `GET /room/:roomId`

Fetch current room state. Useful for reconnection or debugging.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "roomId":      "ABC123",
    "status":      "in_progress",
    "players": [
      { "playerId": "uuid-host", "name": "Alice", "cardCount": 5, "score": 0 },
      { "playerId": "uuid-bob",  "name": "Bob",   "cardCount": 6, "score": 12 }
    ],
    "currentTurn": "uuid-host",
    "discardTop":  { "id": "red-7-1", "color": "red", "type": "number", "value": 7 },
    "direction":   "clockwise"
  }
}
```

> `discardTop` is `null` before the first card is played.
> `status` is one of `"waiting"` | `"in_progress"` | `"finished"`.

**Error responses**

| Status | `error` |
|--------|---------|
| `404`  | `"Room not found"` |

---

## WebSocket

### Connecting

```
ws://localhost:3000/ws?roomId=ABC123&playerId=uuid-bob
```

Both query params are **required**. The server closes the socket with code `1008` if:
- `roomId` or `playerId` is missing
- The room does not exist
- The `playerId` is not registered in that room (i.e. you must call `POST /room/join` or `POST /room/create` before connecting)

---

### Connection Events (server → all players)

#### `PLAYER_JOINED`

Sent to all **other** players when a new client connects.

```json
{
  "type": "PLAYER_JOINED",
  "payload": {
    "playerId":    "uuid-bob",
    "name":        "Bob",
    "playerCount": 2
  }
}
```

---

#### `PLAYER_LEFT`

Sent to all remaining players when a client disconnects.

```json
{
  "type": "PLAYER_LEFT",
  "payload": {
    "playerId": "uuid-bob",
    "name":     "Bob"
  }
}
```

---

### Game Setup

#### `START_GAME` — client (host only) → server

Send this to start the game once enough players have joined.

```json
{ "type": "START_GAME", "payload": {} }
```

**Errors**

| Code | Reason |
|------|--------|
| `NOT_HOST` | Sender is not the host |
| `GAME_ALREADY_STARTED` | Game is not in `"waiting"` status |
| `NOT_ENOUGH_PLAYERS` | Fewer than 2 players in the room |

---

#### `GAME_STARTED` — server → each player (private)

Sent individually to every player. `hand` is private — each player only receives their own cards.

```json
{
  "type": "GAME_STARTED",
  "payload": {
    "hand": [
      { "id": "red-5-1",   "color": "red",  "type": "number", "value": 5 },
      { "id": "wild-2",    "color": null,   "type": "wild",   "value": 0 }
    ],
    "discardTop":  null,
    "deckCount":   94,
    "currentTurn": "uuid-host",
    "players": [
      { "playerId": "uuid-host", "name": "Alice", "cardCount": 7 },
      { "playerId": "uuid-bob",  "name": "Bob",   "cardCount": 7 }
    ]
  }
}
```

> The first turn always goes to the host (the player who created the room).

---

### Turn Events

Turn order per round:

```
PLAY_CARD  (one or more times, before drawing)
    ↓
DRAW_CARD  (exactly once)
    ↓
END_TURN   (or CALL_SHOW instead)
```

---

#### `PLAY_CARD` — client → server

Discard one or more cards from your hand. Can be sent **multiple times per turn** as long as you have not drawn yet. When sending multiple `cardIds`, all cards must be identical (same `type`, `color`, and `value`).

```json
{
  "type": "PLAY_CARD",
  "payload": {
    "cardIds": ["red-5-1", "red-5-2"]
  }
}
```

**Errors**

| Code | Reason |
|------|--------|
| `NOT_YOUR_TURN` | It is not your turn |
| `GAME_NOT_STARTED` | Game is not in progress |
| `ALREADY_DRAWN` | You already drew this turn — cannot play after drawing |
| `INVALID_CARD` | One or more card IDs not found in your hand |
| `INVALID_STACK` | Multiple cards provided but they are not identical |

---

#### `CARD_PLAYED` — server → all players

```json
{
  "type": "CARD_PLAYED",
  "payload": {
    "playerId":   "uuid-host",
    "cards": [
      { "id": "red-5-1", "color": "red", "type": "number", "value": 5 }
    ],
    "discardTop": { "id": "red-5-1", "color": "red", "type": "number", "value": 5 }
  }
}
```

---

#### `DRAW_CARD` — client → server

Draw one card after playing. Choose `"deck"` for an unknown card or `"discard"` to take the visible top of the discard pile. Can only be sent **once per turn** and only **after at least one `PLAY_CARD`**.

```json
{
  "type": "DRAW_CARD",
  "payload": {
    "source": "deck"
  }
}
```

> `source`: `"deck"` | `"discard"`

**Errors**

| Code | Reason |
|------|--------|
| `NOT_YOUR_TURN` | It is not your turn |
| `GAME_NOT_STARTED` | Game is not in progress |
| `MUST_PLAY_FIRST` | You have not played a card yet this turn |
| `ALREADY_DRAWN` | You already drew this turn |
| `INVALID_SOURCE` | `source` is not `"deck"` or `"discard"` |
| `INVALID_CARD` | `source` is `"discard"` but the discard pile is empty, or no cards remain anywhere |

---

#### `CARD_DRAWN` — server → drawing player only

```json
{
  "type": "CARD_DRAWN",
  "payload": {
    "card":   { "id": "blue-4-2", "color": "blue", "type": "number", "value": 4 },
    "source": "deck"
  }
}
```

---

#### `CARD_DRAWN_BROADCAST` — server → all other players

```json
{
  "type": "CARD_DRAWN_BROADCAST",
  "payload": {
    "playerId":   "uuid-host",
    "source":     "discard",
    "cardCount":  6,
    "discardTop": null
  }
}
```

> `discardTop` is `null` when `source` is `"deck"` (discard pile unchanged).
> `discardTop` is the new top card (or `null` if the pile is now empty) when `source` is `"discard"`.

---

#### `END_TURN` — client → server

End your turn after playing and drawing.

```json
{ "type": "END_TURN", "payload": {} }
```

**Errors**

| Code | Reason |
|------|--------|
| `NOT_YOUR_TURN` | It is not your turn |
| `GAME_NOT_STARTED` | Game is not in progress |
| `MUST_PLAY_FIRST` | You have not played a card this turn |
| `MUST_DRAW_FIRST` | You have not drawn a card this turn |

---

#### `TURN_CHANGED` — server → all players

```json
{
  "type": "TURN_CHANGED",
  "payload": {
    "currentTurn": "uuid-bob"
  }
}
```

---

### Show

#### `CALL_SHOW` — client → server

Call SHOW when you believe you have the lowest hand value. Must be sent on your turn (before or after playing — no play/draw requirement).

```json
{ "type": "CALL_SHOW", "payload": {} }
```

**Errors**

| Code | Reason |
|------|--------|
| `NOT_YOUR_TURN` | It is not your turn |
| `GAME_NOT_STARTED` | Game is not in progress |

---

#### `SHOW_RESULT` — server → all players

```json
{
  "type": "SHOW_RESULT",
  "payload": {
    "callerId":  "uuid-host",
    "callerWon": true,
    "hands": [
      {
        "playerId":   "uuid-host",
        "name":       "Alice",
        "hand":       [ { "id": "red-2-1", "color": "red", "type": "number", "value": 2 } ],
        "handValue":  2,
        "penalty":    0,
        "scoreAdded": 2
      },
      {
        "playerId":   "uuid-bob",
        "name":       "Bob",
        "hand":       [ { "id": "green-skip-1", "color": "green", "type": "skip", "value": 10 } ],
        "handValue":  10,
        "penalty":    0,
        "scoreAdded": 10
      }
    ],
    "roundWinner": { "playerId": "uuid-host", "name": "Alice" },
    "scores": [
      { "playerId": "uuid-host", "name": "Alice", "totalScore": 2  },
      { "playerId": "uuid-bob",  "name": "Bob",   "totalScore": 10 }
    ]
  }
}
```

> `callerWon` is `true` only if the caller's `handValue` is **strictly lower** than every other player's.
> `penalty` is `25` on the caller if `callerWon` is `false`, otherwise `0`.
> `roundWinner` is the player with the **lowest total score** after this round's additions.

---

#### `GAME_OVER` — server → all players

Sent immediately after `SHOW_RESULT`.

```json
{
  "type": "GAME_OVER",
  "payload": {
    "winner": { "playerId": "uuid-host", "name": "Alice" },
    "finalScores": [
      { "playerId": "uuid-host", "name": "Alice", "totalScore": 2  },
      { "playerId": "uuid-bob",  "name": "Bob",   "totalScore": 10 }
    ]
  }
}
```

> Winner is the player with the **lowest** total score.

---

### Error Event

Sent privately to the player whose action caused the error.

```json
{
  "type": "ERROR",
  "payload": {
    "code":    "NOT_YOUR_TURN",
    "message": "It is not your turn to play"
  }
}
```

**All error codes**

| Code | Trigger |
|------|---------|
| `INVALID_MESSAGE` | Message body is not valid JSON |
| `UNKNOWN_ACTION` | `type` field not recognised |
| `ROOM_NOT_FOUND` | Room no longer exists |
| `NOT_HOST` | Non-host sent `START_GAME` |
| `GAME_ALREADY_STARTED` | `START_GAME` sent after game began |
| `NOT_ENOUGH_PLAYERS` | `START_GAME` with fewer than 2 players |
| `GAME_NOT_STARTED` | Game action sent when status is not `in_progress` |
| `NOT_YOUR_TURN` | Action sent when it is not your turn |
| `ALREADY_DRAWN` | Played after drawing, or drew more than once |
| `INVALID_CARD` | Card not in hand / discard pile empty / no cards left |
| `INVALID_STACK` | Multiple cards in `cardIds` are not identical |
| `INVALID_SOURCE` | `source` is not `"deck"` or `"discard"` |
| `MUST_PLAY_FIRST` | Drew or ended turn without playing first |
| `MUST_DRAW_FIRST` | Ended turn without drawing |
