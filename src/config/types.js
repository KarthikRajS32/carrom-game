// Game type definitions and enums
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
  PLACING: 'PLACING',
  AIMING: 'AIMING',
  SHOOTING: 'SHOOTING',
  SETTLING: 'SETTLING'
};