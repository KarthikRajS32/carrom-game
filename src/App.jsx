import React, { memo } from 'react';
import { GameMode } from './src/config/types.js';
import { useGameState } from './src/hooks/useGameState.js';
import MainMenu from './src/components/MainMenu.jsx';
import GameCanvas from './src/components/GameCanvas.jsx';

const App = memo(() => {
  const { mode, settings, gameState, updateGameState, startGame, exitGame } = useGameState();

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