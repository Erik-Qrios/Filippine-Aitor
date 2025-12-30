
import React from 'react';
import { RefreshCw, Lightbulb, Play, ChevronRight } from 'lucide-react';
import { KeyboardLayout } from '../types';

interface GameControlsProps {
  onNewGame: () => void;
  onHint: () => void;
  onNextWord: () => void;
  onReset: () => void;
  isKeyboardVisible: boolean;
  onCheck: () => void;
  density: number;
  setDensity: (d: number) => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onNewGame, onHint, onNextWord, onReset, density, setDensity
}) => {
  return (
    <div className="flex flex-col bg-white border-b border-slate-200 shadow-sm relative z-20">
      <div className="flex items-center justify-between gap-1 p-1 px-2 h-14">
        {/* Linkse Groep: Systeem acties */}
        <div className="flex gap-1 items-center">
          <button 
            onClick={onNewGame} 
            className="flex flex-col items-center justify-center w-10 h-10 text-[8px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
          >
            <Play size={16} />
            <span>Nieuw</span>
          </button>
          <button 
            onClick={onReset} 
            className="flex flex-col items-center justify-center w-10 h-10 text-[8px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            <RefreshCw size={16} />
            <span>Wis</span>
          </button>
        </div>

        {/* Midden: Moeilijkheidsgraad Slider */}
        <div className="flex-1 px-4 flex flex-col items-center justify-center gap-1 min-w-[60px] max-w-[140px]">
          <input 
            type="range" 
            min="0.1" 
            max="1.0" 
            step="0.1" 
            value={density} 
            onChange={(e) => setDensity(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
            Vulling: {Math.round(density * 100)}%
          </span>
        </div>

        {/* Rechtse Groep: Hulp acties */}
        <div className="flex gap-1.5 items-center">
          <button 
            onClick={onHint} 
            className="flex flex-col items-center justify-center px-4 py-1 h-11 min-w-[56px] text-[10px] font-normal text-amber-600 bg-transparent border border-amber-300 rounded-xl shadow-sm hover:bg-amber-50 hover:text-amber-700 transition-all active:scale-95 group"
          >
            <Lightbulb size={20} className="mb-0.5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="uppercase tracking-tighter">Hint</span>
          </button>
          
          <button 
            onClick={onNextWord} 
            className="flex flex-col items-center justify-center w-10 h-10 text-[8px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
          >
            <ChevronRight size={18} />
            <span>Volgende</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
