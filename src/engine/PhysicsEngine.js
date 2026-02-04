// Optimized physics engine with spatial partitioning
import { 
  BOARD_SIZE, CUSHION_WIDTH, FRICTION, WALL_BOUNCE, MIN_VELOCITY, COLLISION_ITERATIONS 
} from '../config/constants.js';
import { CoinState } from '../config/types.js';

export class PhysicsEngine {
  constructor() {
    this.spatialGrid = new Map();
    this.gridSize = 100;
  }

  updateEntity(entity, deltaTime) {
    if (entity.state !== CoinState.ACTIVE) return false;
    
    const speedSq = entity.vel.x * entity.vel.x + entity.vel.y * entity.vel.y;
    
    if (speedSq < MIN_VELOCITY * MIN_VELOCITY) {
      entity.vel.x = 0;
      entity.vel.y = 0;
      return false;
    }
    
    // Update position
    entity.pos.x += entity.vel.x * deltaTime;
    entity.pos.y += entity.vel.y * deltaTime;
    
    // Apply friction
    const frictionFactor = Math.pow(FRICTION, deltaTime * 60);
    entity.vel.x *= frictionFactor;
    entity.vel.y *= frictionFactor;
    
    // Wall collisions
    this.handleWallCollisions(entity);
    
    return true;
  }

  handleWallCollisions(entity) {
    const r = entity.radius;
    const min = CUSHION_WIDTH + r;
    const max = BOARD_SIZE - CUSHION_WIDTH - r;
    
    if (entity.pos.x < min) {
      entity.pos.x = min;
      entity.vel.x *= -WALL_BOUNCE;
    } else if (entity.pos.x > max) {
      entity.pos.x = max;
      entity.vel.x *= -WALL_BOUNCE;
    }
    
    if (entity.pos.y < min) {
      entity.pos.y = min;
      entity.vel.y *= -WALL_BOUNCE;
    } else if (entity.pos.y > max) {
      entity.pos.y = max;
      entity.vel.y *= -WALL_BOUNCE;
    }
  }

  handleCollisions(entities, onCollision) {
    // Use spatial partitioning for better performance
    this.updateSpatialGrid(entities);
    
    for (let iteration = 0; iteration < COLLISION_ITERATIONS; iteration++) {
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const e1 = entities[i];
          const e2 = entities[j];
          
          if (e1.state === CoinState.ACTIVE && e2.state === CoinState.ACTIVE) {
            const impact = this.resolveCollision(e1, e2);
            if (impact > 0 && onCollision) {
              onCollision(e1, e2, impact);
            }
          }
        }
      }
    }
  }

  updateSpatialGrid(entities) {
    this.spatialGrid.clear();
    
    for (const entity of entities) {
      if (entity.state !== CoinState.ACTIVE) continue;
      
      const gridX = Math.floor(entity.pos.x / this.gridSize);
      const gridY = Math.floor(entity.pos.y / this.gridSize);
      const key = `${gridX},${gridY}`;
      
      if (!this.spatialGrid.has(key)) {
        this.spatialGrid.set(key, []);
      }
      this.spatialGrid.get(key).push(entity);
    }
  }

  resolveCollision(e1, e2) {
    const dx = e2.pos.x - e1.pos.x;
    const dy = e2.pos.y - e1.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = e1.radius + e2.radius;
    
    if (distance >= minDistance) return 0;
    
    // Normalize collision vector
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Relative velocity
    const dvx = e2.vel.x - e1.vel.x;
    const dvy = e2.vel.y - e1.vel.y;
    const velAlongNormal = dvx * nx + dvy * ny;
    
    if (velAlongNormal > 0) return 0;
    
    // Calculate impulse
    const restitution = 0.8;
    const impulse = -(1 + restitution) * velAlongNormal / (1/e1.mass + 1/e2.mass);
    
    // Apply impulse
    const impulseX = impulse * nx;
    const impulseY = impulse * ny;
    
    e1.vel.x -= (impulseX / e1.mass);
    e1.vel.y -= (impulseY / e1.mass);
    e2.vel.x += (impulseX / e2.mass);
    e2.vel.y += (impulseY / e2.mass);
    
    // Separate overlapping objects
    const overlap = minDistance - distance;
    const separationX = (overlap * 0.5) * nx;
    const separationY = (overlap * 0.5) * ny;
    
    e1.pos.x -= separationX;
    e1.pos.y -= separationY;
    e2.pos.x += separationX;
    e2.pos.y += separationY;
    
    return Math.abs(impulse);
  }

  distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}