import React, { useEffect, useRef, useCallback, memo } from 'react';
import { GameEngine } from '../engine/GameEngine.js';
import { PlayMode } from '../config/types.js';
import { PERFORMANCE } from '../config/constants.js';
import UIOverlay from './UIOverlay.jsx';

const GameCanvas = memo(({ settings, gameState, onStateChange, onExit }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(
      canvasRef.current,
      settings,
      onStateChange,
      settings.playMode === PlayMode.ONLINE ? (type, payload) => {
        // Handle network sync
      } : null
    );

    engineRef.current = engine;

    const gameLoop = (currentTime) => {
      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 1000,
        PERFORMANCE.MAX_DELTA_TIME
      );
      lastTimeRef.current = currentTime;

      if (deltaTime > 0) {
        engine.update(deltaTime);
        engine.render();
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [settings, onStateChange]);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    engineRef.current?.handleInput('start', { x: e.clientX, y: e.clientY });
  }, []);

  const handlePointerMove = useCallback((e) => {
    e.preventDefault();
    engineRef.current?.handleInput('move', { x: e.clientX, y: e.clientY });
  }, []);

  const handlePointerUp = useCallback((e) => {
    e.preventDefault();
    engineRef.current?.handleInput('end', { x: e.clientX, y: e.clientY });
  }, []);

  const handleUndoAim = useCallback(() => {
    engineRef.current?.undoAim();
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-stone-950 overflow-hidden">
      <div className="relative p-1 sm:p-2 bg-stone-900 rounded-3xl sm:rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-stone-800">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="rounded-2xl sm:rounded-[30px] shadow-xl sm:shadow-2xl cursor-crosshair touch-none"
          style={{ 
            maxWidth: '95vmin', 
            maxHeight: '95vmin',
            width: '100%',
            height: '100%'
          }}
        />
      </div>
      
      <UIOverlay 
        gameState={gameState}
        onMenu={onExit}
        onUndoAim={handleUndoAim}
      />
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;