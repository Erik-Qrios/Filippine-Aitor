
import React from 'react';
import { RefreshCw, Lightbulb, Play, Keyboard as KeyboardIcon } from 'lucide-react';
import { KeyboardLayout } from '../types';

interface GameControlsProps {
  onNewGame: () => void;
  onHint: () => void;
  onReset: () => void;
  isKeyboardVisible: boolean;
  layout: KeyboardLayout;
  toggleKeyboard: () => void;
  onCheck: () => void;
  density: number;
  setDensity: (d: number) => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onNewGame, onHint, onReset, isKeyboardVisible, layout, toggleKeyboard, onCheck, density, setDensity
}) => {
  const getKeyboardLabel = () => {
    if (!isKeyboardVisible) return 'Toetsen';
    return layout === 'AZERTY' ? 'Azerty' : 'Qwerty';
  };

  return (
    <div className="flex flex-col bg-white border-b border-slate-200">
      <div className="flex items-center justify-between gap-1 p-1 px-2 h-12">
        {/* Linker groep */}
        <div className="flex gap-0.5 items-center">
          <button 
            onClick={onNewGame} 
            className="flex flex-col items-center justify-center p-1 text-[8px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Play size={14} />
            <span>Nieuw</span>
          </button>
          <button 
            onClick={onReset} 
            className="flex flex-col items-center justify-center p-1 text-[8px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <RefreshCw size={14} />
            <span>Wis</span>
          </button>
        </div>

        {/* Centrale Schuifbalk (Dichtheid) met Percentage */}
        <div className="flex-1 px-2 flex items-center justify-center gap-2 min-w-[80px] max-w-[140px]">
          <input 
            type="range" 
            min="0.1" 
            max="1.0" 
            step="0.1" 
            value={density} 
            onChange={(e) => setDensity(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-[9px] font-black text-slate-400 w-6 text-right">
            {Math.round(density * 100)}%
          </span>
        </div>

        {/* Rechter groep */}
        <div className="flex gap-0.5 items-center">
          <button 
            onClick={onHint} 
            className="flex flex-col items-center justify-center p-1 text-[8px] font-bold text-slate-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
          >
            <Lightbulb size={14} />
            <span>Hint</span>
          </button>
          
          <button 
            onClick={toggleKeyboard} 
            className={`flex flex-col items-center justify-center p-1 min-w-[44px] text-[8px] font-bold rounded transition-all duration-200 ${isKeyboardVisible ? 'text-blue-600 bg-blue-50 shadow-inner' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <KeyboardIcon size={14} className={isKeyboardVisible ? 'mb-0.5' : 'mb-0'} />
            <span className="leading-tight">
              {getKeyboardLabel()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameControls;
