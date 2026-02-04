// Game configuration constants
export const BOARD_SIZE = 800;
export const POCKET_RADIUS = 20;
export const CUSHION_WIDTH = 45;
export const PLAY_AREA_PADDING = 65;

export const STRIKER_RADIUS = 22;
export const COIN_RADIUS = 15;

export const FRICTION = 0.985;
export const WALL_BOUNCE = 0.7;
export const COIN_BOUNCE = 0.85;

export const MAX_POWER = 28;
export const MIN_VELOCITY = 0.15;
export const TURN_TIME_LIMIT = 20;
export const COLLISION_ITERATIONS = 4; // Reduced for better performance

export const COLORS = {
  BOARD_BG: '#F3E5AB',
  BOARD_BORDER: '#2D1B14',
  BOARD_BORDER_HIGHLIGHT: '#422A20',
  LINES: '#1A1A1A',
  POCKET: '#050505',
  WHITE_COIN: '#FFFFFF',
  BLACK_COIN: '#222222',
  QUEEN: '#C62828',
  STRIKER: '#F8F8F8',
  GUIDE_LINE: 'rgba(0, 0, 0, 0.25)',
  POWER_LINE: 'rgba(198, 40, 40, 0.7)',
  MARKING_RED: '#D32F2F'
};

export const PERFORMANCE = {
  TARGET_FPS: 60,
  MAX_DELTA_TIME: 1/30, // Cap delta time to prevent large jumps
  PHYSICS_SUBSTEPS: 2
};