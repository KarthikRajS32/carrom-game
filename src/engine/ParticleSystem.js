// Optimized particle system with object pooling
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.particlePool = [];
    this.maxParticles = 100;
  }

  createPocketEffect(entity, pocket) {
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.getParticle();
      if (!particle) break;
      
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      
      particle.x = entity.pos.x;
      particle.y = entity.pos.y;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = 1.0;
      particle.decay = 0.02;
      particle.size = entity.radius * 0.3;
      particle.color = this.getEntityColor(entity.type);
      particle.active = true;
    }
  }

  getParticle() {
    // Try to reuse from pool
    let particle = this.particlePool.pop();
    
    if (!particle && this.particles.length < this.maxParticles) {
      particle = {
        x: 0, y: 0, vx: 0, vy: 0,
        life: 0, decay: 0, size: 0,
        color: '#ffffff', active: false
      };
      this.particles.push(particle);
    }
    
    return particle;
  }

  update(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      if (!p.active) continue;
      
      p.x += p.vx * deltaTime * 60;
      p.y += p.vy * deltaTime * 60;
      p.life -= p.decay * deltaTime * 60;
      
      if (p.life <= 0) {
        p.active = false;
        this.particlePool.push(p);
      }
    }
  }

  render(ctx) {
    ctx.save();
    
    for (const p of this.particles) {
      if (!p.active || p.life <= 0) continue;
      
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  getEntityColor(type) {
    switch (type) {
      case 'WHITE': return '#ffffff';
      case 'BLACK': return '#222222';
      case 'QUEEN': return '#C62828';
      default: return '#ffffff';
    }
  }
}