// Core game engine with performance optimizations
import { 
  BOARD_SIZE, POCKET_RADIUS, CUSHION_WIDTH, PLAY_AREA_PADDING, 
  STRIKER_RADIUS, COIN_RADIUS, FRICTION, MAX_POWER, MIN_VELOCITY, 
  COLORS, WALL_BOUNCE, TURN_TIME_LIMIT, COLLISION_ITERATIONS 
} from '../config/constants.js';
import { GamePhase, CoinType, CoinState, PlayMode } from '../config/types.js';
import { PhysicsEngine } from './PhysicsEngine.js';
import { AudioManager } from './AudioManager.js';
import { ParticleSystem } from './ParticleSystem.js';

export class GameEngine {
  constructor(canvas, settings, onStateChange, onNetworkSync) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    this.settings = settings;
    this.onStateChange = onStateChange;
    this.onNetworkSync = onNetworkSync;

    // Core systems
    this.physics = new PhysicsEngine();
    this.audio = new AudioManager(settings.soundEnabled);
    this.particles = new ParticleSystem();
    
    // Game state
    this.entities = new Map();
    this.striker = null;
    this.gameState = {
      phase: GamePhase.PLACING,
      turn: CoinType.WHITE,
      score: { white: 0, black: 0, queenPocketedBy: null, queenCovered: false, winner: null },
      timeLeft: TURN_TIME_LIMIT,
      message: null
    };

    // Input handling
    this.input = {
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      dragCurrent: { x: 0, y: 0 }
    };

    // Performance tracking
    this.lastTime = 0;
    this.frameCount = 0;
    this.fps = 60;

    this.init();
  }

  init() {
    this.setupCanvas();
    this.createEntities();
    this.resetGame();
  }

  setupCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9;
    
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    
    this.ctx.scale(dpr, dpr);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  createEntities() {
    const cx = BOARD_SIZE / 2;
    const cy = BOARD_SIZE / 2;

    // Create striker
    this.striker = {
      id: 'striker',
      type: CoinType.STRIKER,
      pos: { x: cx, y: BOARD_SIZE - CUSHION_WIDTH - PLAY_AREA_PADDING },
      vel: { x: 0, y: 0 },
      radius: STRIKER_RADIUS,
      mass: 3.5,
      state: CoinState.ACTIVE
    };

    // Create coins in optimized formation
    this.entities.clear();
    
    // Queen at center
    this.addCoin(CoinType.QUEEN, cx, cy);
    
    // Inner ring (6 coins)
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60) * (Math.PI / 180);
      const dist = COIN_RADIUS * 2.1;
      const type = i % 2 === 0 ? CoinType.WHITE : CoinType.BLACK;
      this.addCoin(type, cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
    }
    
    // Outer ring (12 coins)
    const pattern = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0]; // Optimized pattern
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30) * (Math.PI / 180);
      const dist = COIN_RADIUS * 4.1;
      const type = pattern[i] ? CoinType.BLACK : CoinType.WHITE;
      this.addCoin(type, cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
    }
  }

  addCoin(type, x, y) {
    const id = `${type}_${this.entities.size}`;
    this.entities.set(id, {
      id,
      type,
      pos: { x, y },
      vel: { x: 0, y: 0 },
      radius: COIN_RADIUS,
      mass: 1.2,
      state: CoinState.ACTIVE
    });
  }

  update(deltaTime) {
    this.updateTimer(deltaTime);
    
    if (this.gameState.phase === GamePhase.SHOOTING) {
      this.updatePhysics(deltaTime);
    }
    
    this.particles.update(deltaTime);
    this.checkGameEnd();
  }

  updatePhysics(deltaTime) {
    const allEntities = [this.striker, ...this.entities.values()];
    const activeEntities = allEntities.filter(e => e.state === CoinState.ACTIVE);
    
    let hasMovement = false;
    
    // Update positions and velocities
    for (const entity of activeEntities) {
      if (this.physics.updateEntity(entity, deltaTime)) {
        hasMovement = true;
      }
    }
    
    // Handle collisions
    this.physics.handleCollisions(activeEntities, (e1, e2, impact) => {
      if (impact > 5) this.audio.playHit();
    });
    
    // Check pockets
    this.checkPockets(activeEntities);
    
    if (!hasMovement) {
      this.gameState.phase = GamePhase.SETTLING;
      setTimeout(() => this.endTurn(), 300);
    }
  }

  checkPockets(entities) {
    const pockets = [
      { x: POCKET_RADIUS + 5, y: POCKET_RADIUS + 5 },
      { x: BOARD_SIZE - POCKET_RADIUS - 5, y: POCKET_RADIUS + 5 },
      { x: POCKET_RADIUS + 5, y: BOARD_SIZE - POCKET_RADIUS - 5 },
      { x: BOARD_SIZE - POCKET_RADIUS - 5, y: BOARD_SIZE - POCKET_RADIUS - 5 }
    ];

    for (const entity of entities) {
      for (const pocket of pockets) {
        if (this.physics.distance(entity.pos, pocket) < POCKET_RADIUS * 1.05) {
          this.pocketEntity(entity, pocket);
        }
      }
    }
  }

  pocketEntity(entity, pocket) {
    entity.state = CoinState.POCKETED;
    entity.pos = { x: -500, y: -500 };
    entity.vel = { x: 0, y: 0 };
    
    this.audio.playPocket();
    this.particles.createPocketEffect(entity, pocket);
    
    // Handle game logic
    if (entity.type === CoinType.STRIKER) {
      this.handleFoul();
    } else {
      this.handleScore(entity);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    
    this.renderBoard();
    this.renderEntities();
    this.particles.render(this.ctx);
    
    if (this.gameState.phase === GamePhase.AIMING && this.input.isDragging) {
      this.renderAimGuide();
    }
  }

  renderBoard() {
    // Optimized board rendering with cached patterns
    this.ctx.fillStyle = COLORS.BOARD_BORDER;
    this.ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    
    this.ctx.fillStyle = COLORS.BOARD_BG;
    this.ctx.fillRect(CUSHION_WIDTH, CUSHION_WIDTH, 
      BOARD_SIZE - CUSHION_WIDTH * 2, BOARD_SIZE - CUSHION_WIDTH * 2);
    
    this.renderBoardMarkings();
  }

  renderBoardMarkings() {
    const cx = BOARD_SIZE / 2;
    const cy = BOARD_SIZE / 2;
    
    this.ctx.strokeStyle = COLORS.LINES;
    this.ctx.lineWidth = 1.5;
    
    // Center circle
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, COIN_RADIUS * 4.5, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Pockets
    const corners = [[0,0], [BOARD_SIZE,0], [0,BOARD_SIZE], [BOARD_SIZE,BOARD_SIZE]];
    this.ctx.fillStyle = COLORS.POCKET;
    for (const [x, y] of corners) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, POCKET_RADIUS + 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  renderEntities() {
    const allEntities = [this.striker, ...this.entities.values()];
    
    for (const entity of allEntities) {
      if (entity.state !== CoinState.ACTIVE) continue;
      
      this.ctx.save();
      this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
      this.ctx.shadowBlur = 3;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      
      const color = this.getEntityColor(entity.type);
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(entity.pos.x, entity.pos.y, entity.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    }
  }

  getEntityColor(type) {
    switch (type) {
      case CoinType.WHITE: return COLORS.WHITE_COIN;
      case CoinType.BLACK: return COLORS.BLACK_COIN;
      case CoinType.QUEEN: return COLORS.QUEEN;
      case CoinType.STRIKER: return COLORS.STRIKER;
      default: return '#ffffff';
    }
  }

  renderAimGuide() {
    const { dragStart, dragCurrent } = this.input;
    const dx = dragStart.x - dragCurrent.x;
    const dy = dragStart.y - dragCurrent.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length < 10) return;
    
    const normalizedX = dx / length;
    const normalizedY = dy / length;
    const guideLength = Math.min(length * 3, 200);
    
    this.ctx.save();
    this.ctx.strokeStyle = COLORS.POWER_LINE;
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([8, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.striker.pos.x, this.striker.pos.y);
    this.ctx.lineTo(
      this.striker.pos.x + normalizedX * guideLength,
      this.striker.pos.y + normalizedY * guideLength
    );
    this.ctx.stroke();
    this.ctx.restore();
  }

  handleInput(type, pos) {
    if (this.settings.playMode === PlayMode.AI && this.gameState.turn === CoinType.BLACK) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = (pos.x - rect.left) * (BOARD_SIZE / rect.width);
    const y = (pos.y - rect.top) * (BOARD_SIZE / rect.height);
    
    switch (type) {
      case 'start':
        if (this.physics.distance({ x, y }, this.striker.pos) < STRIKER_RADIUS * 2) {
          this.input.isDragging = true;
          this.input.dragStart = { x, y };
        }
        break;
        
      case 'move':
        if (this.input.isDragging) {
          if (this.gameState.phase === GamePhase.PLACING) {
            this.moveStriker(x);
          } else if (this.gameState.phase === GamePhase.AIMING) {
            this.input.dragCurrent = { x, y };
          }
        }
        break;
        
      case 'end':
        if (this.input.isDragging) {
          this.input.isDragging = false;
          this.handleShoot();
        }
        break;
    }
  }

  moveStriker(x) {
    const minX = CUSHION_WIDTH + PLAY_AREA_PADDING + STRIKER_RADIUS;
    const maxX = BOARD_SIZE - CUSHION_WIDTH - PLAY_AREA_PADDING - STRIKER_RADIUS;
    this.striker.pos.x = Math.max(minX, Math.min(maxX, x));
  }

  handleShoot() {
    if (this.gameState.phase === GamePhase.PLACING) {
      this.gameState.phase = GamePhase.AIMING;
      this.notifyStateChange();
    } else if (this.gameState.phase === GamePhase.AIMING) {
      const { dragStart, dragCurrent } = this.input;
      const dx = dragStart.x - dragCurrent.x;
      const dy = dragStart.y - dragCurrent.y;
      const power = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.15, MAX_POWER);
      
      if (power > 2) {
        const length = Math.sqrt(dx * dx + dy * dy);
        this.striker.vel.x = (dx / length) * power;
        this.striker.vel.y = (dy / length) * power;
        this.gameState.phase = GamePhase.SHOOTING;
        this.notifyStateChange();
      } else {
        this.gameState.phase = GamePhase.PLACING;
        this.notifyStateChange();
      }
    }
  }

  notifyStateChange(message) {
    this.gameState.message = message;
    this.onStateChange({ ...this.gameState });
  }

  resetGame() {
    this.gameState = {
      phase: GamePhase.PLACING,
      turn: CoinType.WHITE,
      score: { white: 0, black: 0, queenPocketedBy: null, queenCovered: false, winner: null },
      timeLeft: TURN_TIME_LIMIT,
      message: null
    };
    
    // Reset all entities
    for (const entity of this.entities.values()) {
      entity.state = CoinState.ACTIVE;
      entity.vel = { x: 0, y: 0 };
    }
    
    this.striker.state = CoinState.ACTIVE;
    this.striker.vel = { x: 0, y: 0 };
    this.resetStrikerPosition();
    
    this.notifyStateChange();
  }

  resetStrikerPosition() {
    const yPos = this.gameState.turn === CoinType.WHITE ? 
      BOARD_SIZE - CUSHION_WIDTH - PLAY_AREA_PADDING : 
      CUSHION_WIDTH + PLAY_AREA_PADDING;
    
    this.striker.pos = { x: BOARD_SIZE / 2, y: yPos };
  }
}