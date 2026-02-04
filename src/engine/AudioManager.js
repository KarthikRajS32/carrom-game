// Optimized audio manager with pooling and caching
export class AudioManager {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.sounds = new Map();
    this.audioPool = new Map();
    this.maxPoolSize = 5;
    
    this.loadSounds();
  }

  loadSounds() {
    const soundUrls = {
      hit: 'https://assets.mixkit.co/sfx/preview/mixkit-billiard-balls-impact-2294.mp3',
      pocket: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3'
    };

    for (const [name, url] of Object.entries(soundUrls)) {
      this.preloadSound(name, url);
    }
  }

  preloadSound(name, url) {
    const audioPool = [];
    
    for (let i = 0; i < this.maxPoolSize; i++) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.7;
      audioPool.push(audio);
    }
    
    this.audioPool.set(name, audioPool);
  }

  play(soundName) {
    if (!this.enabled) return;
    
    const pool = this.audioPool.get(soundName);
    if (!pool) return;
    
    // Find available audio instance
    const audio = pool.find(a => a.paused || a.ended);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  playHit() {
    this.play('hit');
  }

  playPocket() {
    this.play('pocket');
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}