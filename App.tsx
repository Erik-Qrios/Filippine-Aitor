import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { generatePuzzle } from './services/puzzleGenerator';
import { PuzzleData, GameState, KeyboardLayout } from './types';
import VirtualKeyboard from './components/VirtualKeyboard';
import GameControls from './components/GameControls';
import { Clock, Hash, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [gridState, setGridState] = useState<string[][]>([]);
  const [correctRows, setCorrectRows] = useState<boolean[]>([]);
  const [currentRowIdx, setCurrentRowIdx] = useState<number>(0);
  const [currentColIdx, setCurrentColIdx] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [layout, setLayout] = useState<KeyboardLayout>('AZERTY');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const puzzleRef = useRef<PuzzleData | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Toetsenbord standaard aan op mobiel en tablet
    if (window.innerWidth < 1024) setKeyboardVisible(true);
  }, []);

  const startNewGame = useCallback(() => {
    const newPuzzle = generatePuzzle();
    setPuzzle(newPuzzle);
    setGridState(newPuzzle.rows.map(row => Array(row.tokens.length).fill('')));
    setCorrectRows(new Array(newPuzzle.rows.length).fill(false));
    setCurrentRowIdx(0);
    setCurrentColIdx(0);
    setTimer(0);
    setGameState('playing');
  }, []);

  useEffect(() => { startNewGame(); }, [startNewGame]);

  useEffect(() => {
    let interval: number;
    if (gameState === 'playing') {
      interval = window.setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Voice recognition logic
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'nl-NL';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        if (transcript.includes('verwijder') || transcript.includes('wis')) {
          handleBackspace();
        } else if (transcript.length <= 3) {
          const clean = transcript.replace(/[^a-z]/g, '').toUpperCase();
          if (clean) handleVirtualKey(clean);
        }
      };
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (isVoiceMode && recognitionRef.current) recognitionRef.current.start();
    else if (recognitionRef.current) recognitionRef.current.stop();
  }, [isVoiceMode]);

  const syncNumberedCells = (num: number | null, val: string, currentGrid: string[][]) => {
    if (!puzzle || num === null) return currentGrid;
    return currentGrid.map((row, rIdx) => 
      row.map((cell, cIdx) => {
        if (puzzle.rows[rIdx].tokenNumbers[cIdx] === num) return val.toUpperCase();
        return cell;
      })
    );
  };

  const handleCellChange = (rowIdx: number, colIdx: number, val: string) => {
    if (gameState === 'won' || !puzzle) return;
    const upperVal = val.toUpperCase();
    const cellNumber = puzzle.rows[rowIdx].tokenNumbers[colIdx];
    
    setGridState(prev => {
      if (cellNumber !== null) return syncNumberedCells(cellNumber, upperVal, prev);
      const newGrid = [...prev];
      newGrid[rowIdx] = [...newGrid[rowIdx]];
      newGrid[rowIdx][colIdx] = upperVal;
      return newGrid;
    });

    if (upperVal.length >= 1 && colIdx < puzzle.rows[rowIdx].tokens.length - 1) {
       setCurrentColIdx(colIdx + 1);
    }
  };

  const handleVirtualKey = (char: string) => {
    if (gameState === 'won') return;
    handleCellChange(currentRowIdx, currentColIdx, char);
  };

  const handleBackspace = () => {
    if (gameState === 'won' || !puzzle) return;
    const cellNumber = puzzle.rows[currentRowIdx].tokenNumbers[currentColIdx];
    setGridState(prev => {
      if (cellNumber !== null) return syncNumberedCells(cellNumber, '', prev);
      const newGrid = [...prev];
      newGrid[currentRowIdx] = [...newGrid[currentRowIdx]];
      newGrid[currentRowIdx][currentColIdx] = '';
      return newGrid;
    });
    if (currentColIdx > 0) setCurrentColIdx(currentColIdx - 1);
  };

  const handleHint = () => {
    if (!puzzle || gameState === 'won') return;
    const row = gridState[currentRowIdx];
    const solutionTokens = puzzle.rows[currentRowIdx].tokens;
    const wrongIndices = solutionTokens.map((t, i) => row[i] !== t ? i : -1).filter(i => i !== -1);
    if (wrongIndices.length > 0) {
      const randomIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      handleCellChange(currentRowIdx, randomIdx, solutionTokens[randomIdx]);
    }
  };

  useEffect(() => {
    if (!puzzle || gameState === 'won') return;
    const newCorrectRows = puzzle.rows.map((row, rIdx) => gridState[rIdx].join('') === row.tokens.join(''));
    if (JSON.stringify(newCorrectRows) !== JSON.stringify(correctRows)) {
       setCorrectRows(newCorrectRows);
       if (newCorrectRows.every(Boolean)) {
         setGameState('won');
         confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
       }
    }
  }, [gridState, puzzle, gameState]);

  const { maxLeft, maxSlots } = useMemo(() => {
    if (!puzzle) return { maxLeft: 0, maxSlots: 0 };
    const lefts = puzzle.rows.map(r => r.solutionIndex);
    const mLeft = Math.max(...lefts);
    const mSlots = Math.max(...puzzle.rows.map(r => (mLeft - r.solutionIndex) + r.tokens.length));
    return { maxLeft: mLeft, maxSlots: mSlots };
  }, [puzzle]);

  if (!puzzle) return <div className="h-screen flex items-center justify-center font-bold text-blue-600 animate-pulse uppercase tracking-tighter">Laden...</div>;

  const currentCellNumber = puzzle.rows[currentRowIdx]?.tokenNumbers[currentColIdx];
  const visibleNumbers = new Set<number>();
  puzzle.rows.forEach(r => r.tokenNumbers.forEach(n => { if(n !== null) visibleNumbers.add(n); }));

  return (
    <div className="h-screen w-full bg-slate-300 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full relative border-x border-slate-400">
        
        <header className="bg-blue-600 text-white p-2 flex justify-between items-center flex-shrink-0 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-blue-200" />
            <div>
              <h1 className="text-sm font-bold leading-tight">Filippine Aitor</h1>
              <p className="text-blue-200 text-[8px] uppercase font-black tracking-tighter">UA Toegepaste Taalkunde</p>
            </div>
          </div>
          <div className="bg-blue-700 px-2 py-0.5 rounded-full text-[10px] font-mono border border-blue-400/30">
            {Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}
          </div>
        </header>

        <GameControls 
          onNewGame={startNewGame} onReset={() => setGridState(puzzle.rows.map(r => Array(r.tokens.length).fill('')))}
          onHint={handleHint} onCheck={() => {}} isVoiceMode={isVoiceMode}
          toggleVoiceMode={() => setIsVoiceMode(!isVoiceMode)} isListening={isListening}
          isKeyboardVisible={isKeyboardVisible} toggleKeyboard={() => setKeyboardVisible(!isKeyboardVisible)}
        />

        <div className="bg-amber-50 border-b border-amber-100 p-2 flex-shrink-0">
            <div className="text-[8px] font-bold text-amber-600 uppercase mb-0.5 opacity-70">Omschrijving {currentRowIdx + 1}</div>
            <p className="text-slate-900 font-bold text-[11px] sm:text-xs leading-tight line-clamp-2">{puzzle.rows[currentRowIdx].definition}</p>
        </div>

        {/* De Grid - GEOPTIMALISEERD EN GECENTREERD */}
        <div className="flex-1 bg-slate-100 relative overflow-y-auto overflow-x-hidden p-1 flex flex-col items-center">
          <div 
            className="flex flex-col gap-0 w-fit no-select"
            style={{ 
              // We rekenen met een marge van 32px (rijnummer + spacers)
              '--cell-w': `calc((min(100vw, 42rem) - 40px) / ${maxSlots})`,
              '--cell-max-w': '30px', 
              '--final-w': 'min(var(--cell-w), var(--cell-max-w))'
            } as React.CSSProperties}
          >
            {puzzle.rows.map((row, rIdx) => (
              <div 
                key={row.id}
                className={`flex items-center gap-0 py-[1px] transition-all px-1 ${currentRowIdx === rIdx ? 'bg-blue-100/30' : ''}`}
              >
                {/* Rijnummer - subtiel en smal */}
                <div className={`w-4 text-center text-[7px] font-black flex-shrink-0 transition-colors ${correctRows[rIdx] ? 'text-green-500' : 'text-slate-400'}`}>
                  {rIdx + 1}
                </div>
                
                {/* Dynamische spacers voor uitlijning van de roze kolom */}
                {Array.from({ length: maxLeft - row.solutionIndex }).map((_, i) => (
                  <div key={i} className="flex-shrink-0" style={{ width: 'var(--final-w)' }} />
                ))}

                {row.tokens.map((token, cIdx) => {
                  const num = row.tokenNumbers[cIdx];
                  const isSolution = cIdx === row.solutionIndex;
                  const isSelected = currentRowIdx === rIdx && currentColIdx === cIdx;
                  const isSameNumber = num !== null && num === currentCellNumber;

                  return (
                    <div 
                      key={cIdx} 
                      className="relative flex-shrink-0" 
                      style={{ width: 'var(--final-w)', height: 'calc(var(--final-w) * 1.3)' }}
                    >
                      {num !== null && (
                        <span className={`absolute top-0 left-[2px] text-[6px] font-black z-10 pointer-events-none leading-none ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                          {num}
                        </span>
                      )}
                      <div
                        onClick={() => { setCurrentRowIdx(rIdx); setCurrentColIdx(cIdx); }}
                        className={`
                          w-full h-full flex items-center justify-center font-black uppercase border-[0.5px] transition-all cursor-pointer
                          ${isSelected ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 z-20 shadow-sm' : 'border-slate-300'}
                          ${isSolution ? 'bg-pink-100 border-pink-400/30 ring-inset ring-1 ring-pink-200 shadow-sm' : 'bg-white'}
                          ${isSameNumber && !isSelected ? 'bg-blue-100/40 border-blue-200' : ''}
                          ${correctRows[rIdx] ? 'text-green-600 border-green-300 bg-green-50/20' : 'text-slate-900'}
                        `}
                        style={{ fontSize: 'calc(var(--final-w) * 0.75)' }}
                      >
                        {gridState[rIdx][cIdx]}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend - Compact en crisp */}
        <div className="bg-slate-50 border-t border-slate-300 p-1 overflow-x-auto whitespace-nowrap scrollbar-hide flex-shrink-0 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
           <div className="flex gap-1 px-1 h-7 items-center">
              <span className="text-[7px] font-black text-slate-400 uppercase mr-1">CODE</span>
              {Object.entries(puzzle.tokenToNumber)
                .filter(([_, num]) => visibleNumbers.has(num))
                .sort((a,b) => a[1] - b[1])
                .map(([token, num]) => {
                 let char = "";
                 for(let r=0; r<gridState.length; r++) {
                   for(let c=0; c<gridState[r].length; c++) {
                     if(puzzle.rows[r].tokenNumbers[c] === num && gridState[r][c] !== "") {
                       char = gridState[r][c]; break;
                     }
                   }
                   if(char) break;
                 }
                 return (
                   <div key={num} className={`flex flex-col items-center min-w-[16px] border-[1px] rounded transition-all ${char ? 'bg-green-100 border-green-400' : 'bg-white border-slate-200'}`}>
                      <span className="text-[5px] font-bold text-slate-400 leading-none">{num}</span>
                      <span className={`text-[9px] font-black h-2.5 flex items-center justify-center ${char ? 'text-green-800' : 'text-slate-300'}`}>{char || " "}</span>
                   </div>
                 );
              })}
           </div>
        </div>

        {isKeyboardVisible && (
          <VirtualKeyboard 
            layout={layout} toggleLayout={() => setLayout(l => l === 'AZERTY' ? 'QWERTY' : 'AZERTY')}
            onKeyPress={handleVirtualKey} onBackspace={handleBackspace}
          />
        )}

        {gameState === 'won' && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-xs w-full animate-in zoom-in duration-300 border border-slate-200">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-1 tracking-tighter">UITSTEKEND!</h2>
              <div className="bg-blue-50 p-3 rounded-xl mb-4 border border-blue-100">
                <p className="text-blue-400 text-[8px] uppercase font-black mb-1">Verticaal Woord</p>
                <p className="text-2xl font-black text-blue-700 tracking-tighter uppercase">{puzzle.solutionWord}</p>
                <p className="text-slate-500 italic text-[9px] mt-1 line-clamp-3 leading-tight">"{puzzle.solutionDefinition}"</p>
              </div>
              <button onClick={startNewGame} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                Volgende Puzzel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;