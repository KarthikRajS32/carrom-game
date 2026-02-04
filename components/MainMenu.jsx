import React, { useState, useCallback, memo } from 'react';

const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
};

const PlayMode = {
  AI: 'AI',
  LOCAL: 'LOCAL'
};

const MainMenu = memo(({ onStart }) => {
  const [difficulty, setDifficulty] = useState(Difficulty.MEDIUM);
  const [sound, setSound] = useState(true);

  const startAI = useCallback(() => {
    onStart({ playMode: PlayMode.AI, difficulty, soundEnabled: sound });
  }, [onStart, difficulty, sound]);

  const startLocal = useCallback(() => {
    onStart({ playMode: PlayMode.LOCAL, difficulty, soundEnabled: sound });
  }, [onStart, difficulty, sound]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900 text-amber-50 z-50 p-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 text-amber-400 tracking-wider text-center">CARROM MASTER</h1>
      
      <div className="bg-stone-800 p-4 sm:p-6 md:p-8 rounded-lg shadow-2xl border border-stone-600 w-full max-w-sm sm:max-w-md md:max-w-lg relative">
        <div className="space-y-4 sm:space-y-6">
          <button 
            onClick={startAI}
            className="w-full py-3 sm:py-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-md font-bold text-lg sm:text-xl transition-all shadow-lg transform hover:scale-105 active:scale-95"
          >
            Play vs AI
          </button>
          
          <button 
            onClick={startLocal}
            className="w-full py-3 sm:py-4 bg-stone-600 hover:bg-stone-500 active:bg-stone-700 text-white rounded-md font-bold text-lg sm:text-xl transition-all shadow-lg active:scale-95"
          >
            Two Player
          </button>

          <div className="pt-4 border-t border-stone-600">
            <label className="block text-xs sm:text-sm font-medium mb-2 text-stone-400">AI Difficulty</label>
            <div className="flex gap-1 sm:gap-2">
              {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 text-xs sm:text-sm rounded transition-all active:scale-95 ${
                    difficulty === d ? 'bg-amber-700 text-white' : 'bg-stone-700 text-gray-400 hover:bg-stone-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-400 text-sm sm:text-base">Sound Effects</span>
            <button 
              onClick={() => setSound(!sound)}
              className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full p-1 transition-colors active:scale-95 ${
                sound ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full transition-transform ${
                sound ? 'translate-x-5 sm:translate-x-6' : ''
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

MainMenu.displayName = 'MainMenu';

export default MainMenu;