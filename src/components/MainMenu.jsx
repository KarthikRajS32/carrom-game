import React, { useState, useCallback, memo } from 'react';
import { Difficulty, PlayMode } from '../config/types.js';

const MenuState = {
  MAIN: 'MAIN',
  MULTIPLAYER: 'MULTIPLAYER',
  CREATE_ROOM: 'CREATE_ROOM',
  JOIN_ROOM: 'JOIN_ROOM'
};

const MainMenu = memo(({ onStart }) => {
  const [menuState, setMenuState] = useState(MenuState.MAIN);
  const [difficulty, setDifficulty] = useState(Difficulty.MEDIUM);
  const [sound, setSound] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [status, setStatus] = useState('');

  const startAI = useCallback(() => {
    onStart({ playMode: PlayMode.AI, difficulty, soundEnabled: sound });
  }, [onStart, difficulty, sound]);

  const startLocal = useCallback(() => {
    onStart({ playMode: PlayMode.LOCAL, difficulty, soundEnabled: sound });
  }, [onStart, difficulty, sound]);

  const createRoom = useCallback(() => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    setMenuState(MenuState.CREATE_ROOM);
    setStatus('Waiting for opponent...');
    
    const channel = new BroadcastChannel(`carrom_room_${code}`);
    channel.onmessage = (ev) => {
      if (ev.data.type === 'JOIN') {
        channel.postMessage({ type: 'START' });
        channel.close();
        onStart({ 
          playMode: PlayMode.ONLINE, 
          difficulty, 
          soundEnabled: sound, 
          roomId: code, 
          isHost: true 
        });
      }
    };
  }, [onStart, difficulty, sound]);

  const joinRoom = useCallback(() => {
    if (joinCode.length !== 4) return;
    setStatus('Connecting...');
    
    const channel = new BroadcastChannel(`carrom_room_${joinCode}`);
    channel.postMessage({ type: 'JOIN' });
    
    channel.onmessage = (ev) => {
      if (ev.data.type === 'START') {
        channel.close();
        onStart({ 
          playMode: PlayMode.ONLINE, 
          difficulty, 
          soundEnabled: sound, 
          roomId: joinCode, 
          isHost: false 
        });
      }
    };
  }, [onStart, joinCode, difficulty, sound]);

  const handleJoinCodeChange = useCallback((e) => {
    setJoinCode(e.target.value.replace(/\D/g, ''));
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900 text-amber-50 z-50 p-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 md:mb-8 text-amber-400 tracking-wider text-center">
        CARROM MASTER
      </h1>
      
      <div className="bg-stone-800 p-4 sm:p-6 md:p-8 rounded-lg shadow-2xl border border-stone-600 w-full max-w-sm sm:max-w-md md:max-w-lg relative">
        {menuState !== MenuState.MAIN && (
          <button 
            onClick={() => setMenuState(MenuState.MAIN)}
            className="absolute top-2 sm:top-4 left-2 sm:left-4 text-stone-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        )}

        {menuState === MenuState.MAIN && (
          <div className="space-y-4 sm:space-y-6">
            <button 
              onClick={startAI}
              className="w-full py-3 sm:py-4 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-md font-bold text-lg sm:text-xl transition-all shadow-lg transform hover:scale-105 active:scale-95"
            >
              Play vs AI
            </button>
            
            <button 
              onClick={() => setMenuState(MenuState.MULTIPLAYER)}
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
        )}

        {menuState === MenuState.MULTIPLAYER && (
          <div className="space-y-4 sm:space-y-6 mt-4">
            <button 
              onClick={startLocal}
              className="w-full py-3 bg-stone-700 hover:bg-stone-600 active:bg-stone-800 text-white rounded-md font-bold text-sm sm:text-lg transition-all active:scale-95"
            >
              Local Player (Same Device)
            </button>
            <button 
              onClick={createRoom}
              className="w-full py-3 bg-stone-700 hover:bg-stone-600 active:bg-stone-800 text-white rounded-md font-bold text-sm sm:text-lg transition-all active:scale-95"
            >
              Create Room
            </button>
            <button 
              onClick={() => setMenuState(MenuState.JOIN_ROOM)}
              className="w-full py-3 bg-stone-700 hover:bg-stone-600 active:bg-stone-800 text-white rounded-md font-bold text-sm sm:text-lg transition-all active:scale-95"
            >
              Join Room
            </button>
          </div>
        )}

        {menuState === MenuState.CREATE_ROOM && (
          <div className="text-center space-y-4 sm:space-y-6 mt-4">
            <div>
              <div className="text-stone-400 text-xs sm:text-sm mb-2">Room Code</div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold text-amber-400 tracking-widest">
                {roomCode}
              </div>
            </div>
            <div className="text-stone-300 animate-pulse text-sm sm:text-base">{status}</div>
            <p className="text-xs sm:text-sm text-stone-500 px-2">
              Share this code with your friend. <br className="hidden sm:block"/>
              Note: Must be on same local network/browser.
            </p>
          </div>
        )}

        {menuState === MenuState.JOIN_ROOM && (
          <div className="text-center space-y-4 sm:space-y-6 mt-4">
            <div>
              <label className="text-stone-400 text-xs sm:text-sm mb-2 block">Enter Room Code</label>
              <input 
                type="text" 
                maxLength={4}
                value={joinCode}
                onChange={handleJoinCodeChange}
                className="w-24 sm:w-32 text-center text-2xl sm:text-3xl font-mono bg-stone-900 border border-stone-600 text-white rounded p-2 focus:border-amber-500 outline-none transition-colors"
              />
            </div>
            <button 
              onClick={joinRoom}
              disabled={joinCode.length !== 4}
              className="w-full py-3 bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 hover:bg-amber-500 active:bg-amber-700 text-white rounded-md font-bold text-sm sm:text-lg transition-all active:scale-95"
            >
              Join
            </button>
            <div className="text-stone-300 text-xs sm:text-sm">{status}</div>
          </div>
        )}
      </div>
    </div>
  );
});

MainMenu.displayName = 'MainMenu';

export default MainMenu;