export interface WordEntry {
  word: string;
  definition: string;
}

export interface PuzzleRow {
  id: string;
  word: string;
  tokens: string[]; // Tokenized word (e.g. ['IJ', 'S'] instead of ['I', 'J', 'S'])
  tokenNumbers: (number | null)[]; // Unique number or null if not numbered
  definition: string;
  solutionIndex: number; // The index in the tokens array that overlaps the solution column
  displayOffset: number; // Visual offset to align the solution column
}

export interface PuzzleData {
  solutionWord: string;
  solutionDefinition: string;
  solutionTokens: string[];
  rows: PuzzleRow[];
  tokenToNumber: Record<string, number>; // Map tokens to their assigned numbers
  numberToToken: Record<number, string>; // Reverse map
}

export interface GameState {
  status: 'idle' | 'playing' | 'won';
  currentPuzzle: PuzzleData | null;
  gridState: string[][]; // 2D array of user inputs
  correctRows: boolean[];
  timer: number;
  selectedRowIndex: number;
  isVoiceMode: boolean;
}

export type KeyboardLayout = 'AZERTY' | 'QWERTY';