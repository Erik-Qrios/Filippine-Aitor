
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { generatePuzzle } from './services/puzzleGenerator';
import { VOCABULARY } from './services/wordData';
import { PuzzleData, KeyboardLayout } from './types';
import VirtualKeyboard from './components/VirtualKeyboard';
import GameControls from './components/GameControls';
import { CheckCircle2, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").concat(["IJ"]);
const STORAGE_KEY = 'filippine_usage_stats';

const App: React.FC = () => {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [gridState, setGridState] = useState<string[][]>([]);
  const [correctRows, setCorrectRows] = useState<boolean[]>([]);
  const [currentRowIdx, setCurrentRowIdx] = useState<number>(0);
  const [currentColIdx, setCurrentColIdx] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [layout, setLayout] = useState<KeyboardLayout>('AZERTY');
  const [isKeyboardVisible, setKeyboardVisible] = useState(true);
  const [density, setDensity] = useState(0.7);
  
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // Bereken voortgang voor de UI
  const discoveredWordsCount = useMemo(() => {
    return Object.keys(usageCounts).length;
  }, [usageCounts]);

  const stateRef = useRef({
    currentRowIdx,
    currentColIdx,
    gameState,
    puzzle,
    gridState,
    usageCounts
  });

  useEffect(() => {
    stateRef.current = { currentRowIdx, currentColIdx, gameState, puzzle, gridState, usageCounts };
  }, [currentRowIdx, currentColIdx, gameState, puzzle, gridState, usageCounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usageCounts));
  }, [usageCounts]);

  const updateUsageForPuzzle = (p: PuzzleData) => {
    setUsageCounts(prev => {
      const next = { ...prev };
      const words = [p.solutionWord, ...p.rows.map(r => r.word)];
      words.forEach(word => {
        const key = word.toLowerCase();
        next[key] = (next[key] || 0) + 1;
      });
      return next;
    });
  };

  const startNewGame = useCallback(() => {
    const newPuzzle = generatePuzzle(density, stateRef.current.usageCounts);
    setPuzzle(newPuzzle);
    updateUsageForPuzzle(newPuzzle);
    setGridState(newPuzzle.rows.map(row => Array(row.tokens.length).fill('')));
    setCorrectRows(new Array(newPuzzle.rows.length).fill(false));
    setCurrentRowIdx(0);
    setCurrentColIdx(0);
    setTimer(0);
    setGameState('playing');
  }, [density]);

  // Initial load
  useEffect(() => {
    if (!puzzle) {
      const counts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const newPuzzle = generatePuzzle(0.7, counts);
      setPuzzle(newPuzzle);
      updateUsageForPuzzle(newPuzzle);
      setGridState(newPuzzle.rows.map(row => Array(row.tokens.length).fill('')));
      setCorrectRows(new Array(newPuzzle.rows.length).fill(false));
    }
  }, []);

  useEffect(() => {
    let interval: number;
    if (gameState === 'playing') {
      interval = window.setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const toggleKeyboardCycle = useCallback(() => {
    if (!isKeyboardVisible) {
      setKeyboardVisible(true);
      setLayout('AZERTY');
    } else if (layout === 'AZERTY') {
      setLayout('QWERTY');
    } else {
      setKeyboardVisible(false);
    }
  }, [isKeyboardVisible, layout]);

  const handleCellChange = useCallback((rowIdx: number, colIdx: number, val: string) => {
    const { gameState, puzzle, gridState } = stateRef.current;
    if (gameState === 'won' || !puzzle) return;
    
    const upperVal = val.toUpperCase();
    const cellNumber = puzzle.rows[rowIdx].tokenNumbers[colIdx];
    
    const newGrid = [...gridState];
    if (cellNumber !== null) {
      for(let r=0; r < newGrid.length; r++) {
        newGrid[r] = [...newGrid[r]];
        for(let c=0; c < newGrid[r].length; c++) {
          if (puzzle.rows[r].tokenNumbers[c] === cellNumber) {
            newGrid[r][c] = upperVal;
          }
        }
      }
    } else {
      newGrid[rowIdx] = [...newGrid[rowIdx]];
      newGrid[rowIdx][colIdx] = upperVal;
    }
    
    setGridState(newGrid);

    if (upperVal === '') return;

    const isRowCorrect = newGrid[rowIdx].join('') === puzzle.rows[rowIdx].tokens.join('');
    
    if (isRowCorrect) {
      for (let i = 1; i <= puzzle.rows.length; i++) {
        const nextR = (rowIdx + i) % puzzle.rows.length;
        const rowIsCorrect = newGrid[nextR].join('') === puzzle.rows[nextR].tokens.join('');
        if (!rowIsCorrect) {
          const firstEmpty = newGrid[nextR].findIndex(c => c === '');
          if (firstEmpty !== -1) {
            setCurrentRowIdx(nextR);
            setCurrentColIdx(firstEmpty);
            return;
          }
        }
      }
    } else {
      const nextEmpty = newGrid[rowIdx].findIndex((c, idx) => idx > colIdx && c === '');
      if (nextEmpty !== -1) {
        setCurrentColIdx(nextEmpty);
      } else {
        const firstEmptyInRow = newGrid[rowIdx].findIndex(c => c === '');
        if (firstEmptyInRow !== -1) {
          setCurrentColIdx(firstEmptyInRow);
        }
      }
    }
  }, []);

  const handleVirtualKey = useCallback((char: string) => {
    const { currentRowIdx, currentColIdx } = stateRef.current;
    handleCellChange(currentRowIdx, currentColIdx, char);
  }, [handleCellChange]);

  const handleBackspace = useCallback(() => {
    const { puzzle, currentRowIdx, currentColIdx, gameState } = stateRef.current;
    if (gameState === 'won' || !puzzle) return;
    
    const cellNumber = puzzle.rows[currentRowIdx].tokenNumbers[currentColIdx];
    setGridState(prev => {
      const newGrid = [...prev];
      if (cellNumber !== null) {
        for(let r=0; r<newGrid.length; r++) {
          newGrid[r] = [...newGrid[r]];
          for(let c=0; c<newGrid[r].length; c++) {
            if (puzzle.rows[r].tokenNumbers[c] === cellNumber) newGrid[r][c] = '';
          }
        }
      } else {
        newGrid[currentRowIdx] = [...newGrid[currentRowIdx]];
        newGrid[currentRowIdx][currentColIdx] = '';
      }
      return newGrid;
    });
    if (currentColIdx > 0) setCurrentColIdx(currentColIdx - 1);
  }, []);

  const handleHint = () => {
    const { puzzle, gridState, currentRowIdx, currentColIdx, gameState } = stateRef.current;
    if (!puzzle || gameState === 'won') return;
    
    const solutionTokens = puzzle.rows[currentRowIdx].tokens;
    const currentVal = gridState[currentRowIdx][currentColIdx];
    const correctToken = solutionTokens[currentColIdx];

    if (currentVal !== correctToken) {
      handleCellChange(currentRowIdx, currentColIdx, correctToken);
    } else {
      const row = gridState[currentRowIdx];
      const wrongIndices = solutionTokens.map((t, i) => row[i] !== t ? i : -1).filter(i => i !== -1);
      if (wrongIndices.length > 0) {
        const firstWrongIdx = wrongIndices[0];
        handleCellChange(currentRowIdx, firstWrongIdx, solutionTokens[firstWrongIdx]);
      }
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
  }, [gridState, puzzle, gameState, correctRows]);

  const { maxLeft, maxSlots } = useMemo(() => {
    if (!puzzle) return { maxLeft: 0, maxSlots: 0 };
    const lefts = puzzle.rows.map(r => r.solutionIndex);
    const mLeft = Math.max(...lefts);
    const mSlots = Math.max(...puzzle.rows.map(r => (mLeft - r.solutionIndex) + r.tokens.length));
    return { maxLeft: mLeft, maxSlots: mSlots };
  }, [puzzle]);

  const revealedMappings = useMemo(() => {
    const mappings: Record<string, number> = {};
    if (!puzzle) return mappings;
    
    for (let r = 0; r < gridState.length; r++) {
      for (let c = 0; c < gridState[r].length; c++) {
        const userChar = gridState[r][c];
        const tokenNum = puzzle.rows[r].tokenNumbers[c];
        if (userChar && tokenNum !== null) {
          mappings[userChar] = tokenNum;
        }
      }
    }
    return mappings;
  }, [gridState, puzzle]);

  if (!puzzle) return <div className="h-screen flex items-center justify-center font-bold text-blue-600 animate-pulse uppercase tracking-tighter">Laden...</div>;

  const currentCellNumber = puzzle.rows[currentRowIdx]?.tokenNumbers[currentColIdx];

  return (
    <div className="h-screen w-full bg-slate-300 flex flex-col items-center overflow-hidden font-sans">
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full relative border-x border-slate-400">
        
        <header className="bg-blue-600 text-white p-2 flex justify-between items-center flex-shrink-0 z-30 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1 rounded-lg">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-xs font-black leading-none tracking-tight uppercase">Filippine Aitor</h1>
              <p className="text-blue-100 text-[8px] uppercase font-black tracking-widest opacity-80 mt-0.5">UA Toegepaste Taalkunde</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="bg-blue-800/40 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-bold border border-white/10 flex items-center gap-1.5">
              <Info size={10} className="text-blue-200" />
              <span className="text-white/90">ONTDEKT: <span className="text-white">{discoveredWordsCount}</span> / {VOCABULARY.length}</span>
            </div>
            <div className="bg-blue-800/50 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-mono font-bold border border-white/20">
              {Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}
            </div>
          </div>
        </header>

        <GameControls 
          onNewGame={startNewGame} onReset={() => setGridState(puzzle.rows.map(r => Array(r.tokens.length).fill('')))}
          onHint={handleHint} onCheck={() => {}} 
          isKeyboardVisible={isKeyboardVisible} layout={layout} toggleKeyboard={toggleKeyboardCycle}
          density={density} setDensity={setDensity}
        />

        <div className="bg-yellow-200/60 border-b border-yellow-300 py-1.5 px-3.5 flex-shrink-0 backdrop-blur-sm shadow-[inset_0_-1px_3px_rgba(0,0,0,0.02)]">
            <p className="text-slate-900 font-bold text-[14px] leading-tight line-clamp-2 text-center">{puzzle.rows[currentRowIdx].definition}</p>
        </div>

        <div className="flex-1 bg-slate-50 relative overflow-y-auto overflow-x-hidden p-2 flex flex-col items-center">
          <div 
            className="flex flex-col gap-0 w-fit no-select"
            style={{ 
              '--cell-w': `calc((min(100vw, 42rem) - 48px) / ${maxSlots})`,
              '--cell-max-w': '30px', 
              '--final-w': 'min(var(--cell-w), var(--cell-max-w))'
            } as React.CSSProperties}
          >
            {puzzle.rows.map((row, rIdx) => (
              <div 
                key={row.id}
                className={`flex items-center gap-0 py-[1.5px] transition-all px-1.5 rounded-sm ${currentRowIdx === rIdx ? 'bg-blue-500/5' : ''}`}
              >
                <div className={`w-5 text-center text-[8px] font-black flex-shrink-0 transition-colors ${correctRows[rIdx] ? 'text-green-500' : 'text-slate-300'}`}>
                  {rIdx + 1}
                </div>
                
                {Array.from({ length: maxLeft - row.solutionIndex }).map((_, i) => (
                  <div key={i} className="flex-shrink-0" style={{ width: 'var(--final-w)' }} />
                ))}

                {row.tokens.map((token, cIdx) => {
                  const num = row.tokenNumbers[cIdx];
                  const isSolution = cIdx === row.solutionIndex;
                  const isSelected = currentRowIdx === rIdx && currentColIdx === cIdx;
                  const isSameNumber = num !== null && num === currentCellNumber;
                  const userVal = gridState[rIdx][cIdx];
                  const isWrong = userVal !== "" && userVal !== token;

                  return (
                    <div 
                      key={cIdx} 
                      className="relative flex-shrink-0" 
                      style={{ width: 'var(--final-w)', height: 'calc(var(--final-w) * 1.35)' }}
                    >
                      {num !== null && (
                        <span className={`absolute top-[1px] left-[2px] text-[7px] font-black z-10 pointer-events-none leading-none ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                          {num}
                        </span>
                      )}
                      <div
                        onClick={() => { setCurrentRowIdx(rIdx); setCurrentColIdx(cIdx); }}
                        className={`
                          w-full h-full flex items-center justify-center font-black uppercase border-[0.5px] transition-all cursor-pointer
                          ${isSelected ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 z-20 shadow-sm scale-[1.05]' : 'border-slate-300'}
                          ${isSolution ? 'bg-pink-50 border-pink-200 ring-inset ring-1 ring-pink-100 shadow-sm' : 'bg-white'}
                          ${isSameNumber && !isSelected ? 'bg-blue-50 border-blue-200' : ''}
                          ${correctRows[rIdx] ? 'text-green-600 border-green-200 bg-green-50/30' : isWrong ? 'text-red-500' : 'text-slate-800'}
                        `}
                        style={{ fontSize: 'calc(var(--final-w) * 0.75)' }}
                      >
                        {userVal}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-b from-yellow-50/90 to-amber-50/80 border-t border-slate-200 p-2 flex-shrink-0 shadow-inner">
           <div className="max-w-full mx-auto flex flex-col gap-1">
              <div className="flex justify-center gap-0.5 w-full">
                {ALPHABET.slice(0, 14).map((letter) => {
                  const num = revealedMappings[letter];
                  return (
                    <div 
                      key={letter} 
                      className="flex flex-col items-center flex-1 max-w-[32px] bg-white border border-slate-200 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden transition-transform active:scale-110"
                    >
                      <div className="h-3 w-full flex items-center justify-center bg-yellow-100/30 border-b border-slate-100">
                        <span className="text-[7px] font-black text-blue-600 leading-none">{num || ""}</span>
                      </div>
                      <div className="h-4 w-full flex items-center justify-center">
                        <span className="text-[9px] font-black text-slate-700 leading-none uppercase">{letter}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-0.5 w-full">
                {ALPHABET.slice(14).map((letter) => {
                  const num = revealedMappings[letter];
                  return (
                    <div 
                      key={letter} 
                      className="flex flex-col items-center flex-1 max-w-[32px] bg-white border border-slate-200 rounded-sm shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden transition-transform active:scale-110"
                    >
                      <div className="h-3 w-full flex items-center justify-center bg-yellow-100/30 border-b border-slate-100">
                        <span className="text-[7px] font-black text-blue-600 leading-none">{num || ""}</span>
                      </div>
                      <div className="h-4 w-full flex items-center justify-center">
                        <span className="text-[9px] font-black text-slate-700 leading-none uppercase">{letter}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {isKeyboardVisible && (
          <VirtualKeyboard 
            layout={layout}
            onKeyPress={handleVirtualKey} onBackspace={handleBackspace}
          />
        )}

        {gameState === 'won' && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full animate-in zoom-in duration-300 border border-slate-200">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter">GEFELICITEERD!</h2>
              <div className="bg-blue-50 p-5 rounded-2xl mb-6 border border-blue-100 shadow-sm">
                <p className="text-blue-500 text-[10px] uppercase font-black mb-1 tracking-widest">Verticaal Woord</p>
                <p className="text-3xl font-black text-blue-700 tracking-tighter uppercase mb-2">{puzzle.solutionWord}</p>
                <p className="text-slate-600 italic text-xs leading-relaxed px-2">"{puzzle.solutionDefinition}"</p>
              </div>
              <button 
                onClick={startNewGame} 
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
              >
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
