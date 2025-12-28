import React from 'react';
import { RefreshCw, Lightbulb, Play, Mic, MicOff, Keyboard as KeyboardIcon } from 'lucide-react';

interface GameControlsProps {
  onNewGame: () => void;
  onHint: () => void;
  onReset: () => void;
  isVoiceMode: boolean;
  toggleVoiceMode: () => void;
  isListening: boolean;
  isKeyboardVisible: boolean;
  toggleKeyboard: () => void;
  onCheck: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ 
  onNewGame, onHint, onReset, isVoiceMode, toggleVoiceMode, isListening, isKeyboardVisible, toggleKeyboard, onCheck
}) => {
  return (
    <div className="flex items-center justify-between gap-1 p-1 px-2 bg-white border-b border-slate-200">
      <div className="flex gap-1">
         <button 
           onClick={onNewGame} 
           className="flex flex-col items-center justify-center p-1.5 text-[8px] font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
         >
           <Play size={16} />
           <span>Nieuw</span>
         </button>
         <button 
           onClick={onReset} 
           className="flex flex-col items-center justify-center p-1.5 text-[8px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
         >
           <RefreshCw size={16} />
           <span>Wis</span>
         </button>
      </div>

      <div className="flex gap-1">
        <button 
            onClick={toggleVoiceMode}
            className={`flex flex-col items-center justify-center p-1.5 text-[8px] font-bold rounded transition-colors ${isVoiceMode ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
            {isListening ? <Mic size={16} className="animate-pulse text-red-500" /> : <MicOff size={16} />}
            <span>Voice</span>
        </button>

        <button 
          onClick={onHint} 
          className="flex flex-col items-center justify-center p-1.5 text-[8px] font-bold text-slate-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
        >
          <Lightbulb size={16} />
          <span>Hint</span>
        </button>
        
        <button 
          onClick={toggleKeyboard} 
          className={`flex flex-col items-center justify-center p-1.5 text-[8px] font-bold rounded transition-colors ${isKeyboardVisible ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <KeyboardIcon size={16} />
          <span>Toetsen</span>
        </button>
      </div>
    </div>
  );
};

export default GameControls;