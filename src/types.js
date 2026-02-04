export const GameMode = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
  PAUSED: 'PAUSED'
};

export const PlayMode = {
  AI: 'AI',
  LOCAL: 'LOCAL',
  ONLINE: 'ONLINE'
};

export const PlayerType = {
  HUMAN: 'HUMAN',
  AI: 'AI'
};

export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
};

export const CoinType = {
  WHITE: 'WHITE',
  BLACK: 'BLACK',
  QUEEN: 'QUEEN',
  STRIKER: 'STRIKER'
};

export const CoinState = {
  ACTIVE: 'ACTIVE',
  POCKETED: 'POCKETED',
  REMOVED: 'REMOVED'
};

export const GamePhase = {
  PLACING: 'PLACING', // Moving striker left/right
  AIMING: 'AIMING',   // Pulling back
  SHOOTING: 'SHOOTING', // Physics active
  SETTLING: 'SETTLING'  // Waiting for pieces to stop
};