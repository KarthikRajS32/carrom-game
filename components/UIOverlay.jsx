import React, { memo } from 'react';

const TURN_TIME_LIMIT = 20;

const GamePhase = {
  PLACING: 'PLACING',
  AIMING: 'AIMING',
  SHOOTING: 'SHOOTING',
  SETTLING: 'SETTLING'
};

const CoinType = {
  WHITE: 'WHITE',
  BLACK: 'BLACK'
};

const UIOverlay = memo(({ gameState, onMenu, onUndoAim }) => {
  const { score, turn, phase, timeLeft, message, winner } = gameState;
  const timePercent = Math.max(0, (timeLeft / TURN_TIME_LIMIT) * 100);
  const isLowTime = timeLeft < 5;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between font-sans">
      {/* Top HUD */}
      <div className="w-full p-2 sm:p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={onMenu} 
          className="bg-stone-900/90 backdrop-blur text-amber-500 px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-stone-700 pointer-events-auto font-bold text-xs hover:bg-amber-500 hover:text-stone-950 transition-all uppercase tracking-tighter"
        >
          Menu
        </button>
        
        <div className="flex items-center gap-2 sm:gap-6">
          {/* White Player */}
          <div className={`flex items-center gap-1 sm:gap-3 transition-all duration-500 ${turn === CoinType.WHITE ? 'scale-110' : 'opacity-40 grayscale'}`}>
            <div className="text-right">
              <div className="text-[8px] sm:text-[10px] text-amber-400/70 uppercase font-black tracking-widest leading-none mb-1">White</div>
              <div className="text-xl sm:text-3xl font-black text-white leading-none">{score.white}</div>
            </div>
            <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-stone-100 border-2 shadow-xl ${turn === CoinType.WHITE ? 'border-amber-400 ring-2 sm:ring-4 ring-amber-400/20' : 'border-stone-500'}`} />
          </div>

          {/* Timer */}
          <div className="flex flex-col items-center gap-1 w-16 sm:w-32">
             <div className="text-[7px] sm:text-[9px] text-stone-400 uppercase font-bold tracking-[0.2em]">Timer</div>
             <div className="w-full h-1 sm:h-1.5 bg-stone-800 rounded-full overflow-hidden border border-stone-700/50">
               <div 
                 className={`h-full transition-all duration-300 ${isLowTime ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}
                 style={{ width: `${timePercent}%` }}
               />
             </div>
          </div>

          {/* Black Player */}
          <div className={`flex items-center gap-1 sm:gap-3 transition-all duration-500 ${turn === CoinType.BLACK ? 'scale-110' : 'opacity-40 grayscale'}`}>
            <div className={`w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-stone-800 border-2 shadow-xl ${turn === CoinType.BLACK ? 'border-amber-400 ring-2 sm:ring-4 ring-amber-400/20' : 'border-stone-500'}`} />
            <div className="text-left">
              <div className="text-[8px] sm:text-[10px] text-amber-400/70 uppercase font-black tracking-widest leading-none mb-1">Black</div>
              <div className="text-xl sm:text-3xl font-black text-white leading-none">{score.black}</div>
            </div>
          </div>
        </div>

        <div className="w-6 sm:w-12" />
      </div>

      {/* Message Banner */}
      {message && (
        <div className="absolute top-12 sm:top-20 left-1/2 -translate-x-1/2 w-full max-w-xs sm:max-w-md px-4 pointer-events-none z-30">
          <div className="bg-amber-500 text-stone-950 text-center py-1 sm:py-2 px-3 sm:px-6 rounded-full font-black text-sm sm:text-lg uppercase tracking-tight shadow-[0_4px_20px_rgba(245,158,11,0.4)] animate-fade-in-down border-2 border-stone-900/20">
            {message}
          </div>
        </div>
      )}

      {/* Bottom HUD */}
      <div className="w-full p-3 sm:p-6 flex items-end justify-between z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
        <div className="flex flex-col gap-1 max-w-[120px] sm:max-w-[200px]">
           <span className="text-amber-500/50 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Status</span>
           <div className="text-white text-xs sm:text-sm font-medium uppercase tracking-tighter">
             {winner ? "Game Complete!" : (
               phase === GamePhase.PLACING ? "Position striker" :
               phase === GamePhase.AIMING ? "Aim & pull back" :
               phase === GamePhase.SHOOTING ? "Strike in progress..." :
               phase === GamePhase.SETTLING ? "Waiting..." : ""
             )}
           </div>
        </div>

        <div className="pointer-events-auto">
          {phase === GamePhase.AIMING && !winner && (
            <button 
              onClick={onUndoAim}
              className="bg-stone-900/95 text-amber-500 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border border-amber-500/30 font-black text-xs sm:text-sm hover:bg-amber-500 hover:text-stone-950 transition-all uppercase tracking-widest shadow-2xl active:scale-95"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Winner Modal */}
      {winner && (
        <div className="absolute inset-0 bg-stone-950/90 flex items-center justify-center pointer-events-auto z-50 backdrop-blur-md p-4">
          {/* Confetti Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-amber-400 animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              />
            ))}
          </div>
          
           <div className="bg-stone-900 p-6 sm:p-12 rounded-3xl border-4 border-amber-500 text-center shadow-[0_0_50px_rgba(251,191,36,0.3)] animate-pulse max-w-xs sm:max-w-sm w-full relative">
              {/* Winner Crown */}
              <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 animate-bounce">👑</div>
              
              <div className="text-amber-500 text-xs sm:text-sm font-bold uppercase tracking-[0.3em] mb-2 animate-pulse">Victory</div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6 italic tracking-tighter animate-pulse">{winner.toUpperCase()}</h2>
              
              {/* Fireworks Effect */}
              <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 text-lg sm:text-2xl animate-spin">✨</div>
              <div className="absolute -top-2 sm:-top-4 -left-2 sm:-left-4 text-lg sm:text-2xl animate-spin" style={{animationDirection: 'reverse'}}>✨</div>
              
              <div className="bg-stone-800 p-3 sm:p-6 rounded-2xl mb-4 sm:mb-8 space-y-2 sm:space-y-3">
                 <div className="flex justify-between text-stone-400 font-bold text-xs uppercase">
                    <span>Final Score</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-white font-medium text-sm sm:text-base">White Team</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 animate-pulse">{score.white}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-white font-medium text-sm sm:text-base">Black Team</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 animate-pulse">{score.black}</span>
                 </div>
              </div>
              <button 
                onClick={onMenu}
                className="bg-amber-500 hover:bg-amber-400 text-stone-900 px-6 sm:px-12 py-3 sm:py-4 rounded-xl font-black w-full transition-all shadow-lg text-sm sm:text-lg uppercase tracking-tight animate-pulse hover:animate-none"
              >
                Return to Menu
              </button>
           </div>
        </div>
      )}
    </div>
  );
});

UIOverlay.displayName = 'UIOverlay';

export default UIOverlay;