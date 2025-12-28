import React from 'react';
import { Delete } from 'lucide-react';
import { KeyboardLayout } from '../types';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter?: () => void;
  layout: KeyboardLayout;
  toggleLayout: () => void;
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

const VirtualKeyboard: React.FC<KeyboardProps> = ({ onKeyPress, onBackspace, onEnter, layout, toggleLayout }) => {
  const keys = LAYOUTS[layout];

  return (
    <div className="w-full bg-slate-200 p-1.5 border-t border-slate-300 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex flex-col gap-1.5 select-none flex-shrink-0">
      <div className="flex justify-between items-center px-1 mb-0.5">
         <button onClick={toggleLayout} className="text-[9px] text-slate-500 font-black bg-slate-300/50 px-2 py-0.5 rounded uppercase tracking-tighter">
            {layout}
         </button>
      </div>
      {keys.map((row, rIndex) => (
        <div key={rIndex} className="flex justify-center gap-1 w-full touch-manipulation">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className={`
                h-10 sm:h-12 bg-white rounded shadow-sm font-black text-slate-800 active:bg-blue-100 active:scale-95 transition-all flex items-center justify-center border-b-2 border-slate-300
                ${key === 'IJ' ? 'flex-[1.5] text-[10px] sm:text-xs' : 'flex-1 text-sm sm:text-lg'}
              `}
            >
              {key}
            </button>
          ))}
          {rIndex === 2 && (
             <button
              onClick={onBackspace}
              className="flex-[1.2] h-10 sm:h-12 bg-slate-400 rounded shadow-sm text-white active:bg-slate-500 active:scale-95 transition-all flex items-center justify-center border-b-2 border-slate-500"
            >
              <Delete size={18} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;