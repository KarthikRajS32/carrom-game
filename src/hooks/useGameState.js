import { useState, useCallback, useRef } from 'react';
import { GameMode, PlayMode, Difficulty, CoinType, GamePhase } from '../config/types.js';

export const useGameState = () => {
  const [mode, setMode] = useState(GameMode.MENU);
  const [settings, setSettings] = useState({
    playMode: PlayMode.AI,
    difficulty: Difficulty.MEDIUM,
    soundEnabled: true
  });

  const [gameState, setGameState] = useState({
    phase: GamePhase.PLACING,
    turn: CoinType.WHITE,
    score: { white: 0, black: 0, queenPocketedBy: null, queenCovered: false, winner: null },
    timeLeft: 20,
    message: null
  });

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const updateGameState = useCallback((newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  }, []);

  const startGame = useCallback((newSettings) => {
    setSettings(newSettings);
    setMode(GameMode.PLAYING);
  }, []);

  const exitGame = useCallback(() => {
    setMode(GameMode.MENU);
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      phase: GamePhase.PLACING,
      turn: CoinType.WHITE,
      score: { white: 0, black: 0, queenPocketedBy: null, queenCovered: false, winner: null },
      timeLeft: 20,
      message: null
    });
  }, []);

  return {
    mode,
    settings,
    gameState,
    gameStateRef,
    updateGameState,
    startGame,
    exitGame,
    resetGame
  };
};