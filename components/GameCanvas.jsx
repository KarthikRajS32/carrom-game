import React, { useEffect, useRef, useCallback, memo } from 'react';
import { CarromEngine } from '../src/engine/CarromEngine.js';
import UIOverlay from './UIOverlay.jsx';

const GameCanvas = memo(({ settings, gameState, onStateChange, onExit }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new CarromEngine(
      canvasRef.current,
      settings,
      onStateChange,
      null
    );

    engineRef.current = engine;

    const gameLoop = () => {
      engine.update();
      engine.draw();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

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
      <div className="relative p-2 bg-stone-900 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-stone-800">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="rounded-[30px] shadow-3xl cursor-crosshair touch-none"
          style={{ 
            maxWidth: '95vmin', 
            maxHeight: '95vmin'
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