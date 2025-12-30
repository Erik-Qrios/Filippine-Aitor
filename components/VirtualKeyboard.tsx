
import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { KeyboardLayout } from '../types';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onToggleLayout: () => void;
  layout: KeyboardLayout;
}

const LAYOUTS = {
  AZERTY: [
    ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
    ['W', 'X', 'C', 'V', 'B', 'N', 'IJ']
  ],
  QWERTY: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'IJ']
  ]
};

const VirtualKeyboard: React.FC<KeyboardProps> = ({ onKeyPress, onBackspace, onToggleLayout, layout }) => {
  const keys = LAYOUTS[layout];

  return (
    <div className="w-full bg-slate-200/95 backdrop-blur-md p-2 pb-6 border-t border-slate-300 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col gap-1.5 select-none flex-shrink-0">
      <div className="flex flex-col gap-1.5">
        {keys.map((row, rIndex) => (
          <div key={rIndex} className="flex justify-center gap-1.5 w-full touch-manipulation">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`
                  h-10 sm:h-12 bg-white rounded-lg shadow-[0_2px_0_0_#cbd5e1] font-black text-slate-800 
                  active:bg-slate-100 active:shadow-none active:translate-y-[2px] 
                  transition-all flex items-center justify-center border border-slate-200/50 flex-1
                  ${key === 'IJ' ? 'text-[10px] sm:text-xs' : 'text-sm sm:text-lg'}
                `}
              >
                {key}
              </button>
            ))}
            
            {/* Specifieke knoppen voor de laatste rij */}
            {rIndex === 2 && (
              <>
                {/* Layout Wissel Knop: Tussen IJ en Backspace */}
                <button
                  onClick={onToggleLayout}
                  className="flex-1 h-10 sm:h-12 bg-blue-500 rounded-lg shadow-[0_2px_0_0_#2563eb] text-white font-black text-[8px] sm:text-[10px] uppercase
                  active:bg-blue-600 active:shadow-none active:translate-y-[2px] 
                  transition-all flex items-center justify-center border border-blue-600/20"
                >
                  {layout === 'AZERTY' ? 'AZ' : 'QW'}
                </button>

                {/* Backspace Knop */}
                <button
                  onClick={onBackspace}
                  className="flex-1 h-10 sm:h-12 bg-slate-400 rounded-lg shadow-[0_2px_0_0_#64748b] text-white 
                  active:bg-slate-500 active:shadow-none active:translate-y-[2px] 
                  transition-all flex items-center justify-center border border-slate-500/20"
                >
                  <Delete size={18} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualKeyboard;
