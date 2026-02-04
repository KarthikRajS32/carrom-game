import React, { memo } from 'react';
import MainMenu from './components/MainMenu.jsx';
import GameCanvas from './components/GameCanvas.jsx';

const GameMode = {
  MENU: 'MENU',
  PLAYING: 'PLAYING'
};

const App = memo(() => {
  const [mode, setMode] = React.useState(GameMode.MENU);
  const [settings, setSettings] = React.useState({
    playMode: 'AI',
    difficulty: 'MEDIUM',
    soundEnabled: true
  });

  const [gameState, setGameState] = React.useState({
    phase: 'PLACING',
    turn: 'WHITE',
    score: { white: 0, black: 0, queenPocketedBy: null, queenCovered: false, winner: null },
    timeLeft: 20,
    message: null
  });

  const startGame = React.useCallback((newSettings) => {
    setSettings(newSettings);
    setMode(GameMode.PLAYING);
  }, []);

  const exitGame = React.useCallback(() => {
    setMode(GameMode.MENU);
  }, []);

  const updateGameState = React.useCallback((newState) => {
    setGameState(prev => ({ ...prev, ...newState }));
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-stone-950 select-none">
      {mode === GameMode.MENU && (
        <MainMenu onStart={startGame} />
      )}
      {mode === GameMode.PLAYING && (
        <GameCanvas 
          settings={settings} 
          gameState={gameState}
          onStateChange={updateGameState}
          onExit={exitGame} 
        />
      )}
    </div>
  );
});

App.displayName = 'App';

export default App;