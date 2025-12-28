
import { PuzzleData, PuzzleRow, WordEntry } from '../types';
import { VOCABULARY } from './wordData';
import { parseTokens } from './utils';

export const generatePuzzle = (density: number = 0.65): PuzzleData => {
  // 1. Kies een verticaal oplossingswoord.
  const potentialSolutions = VOCABULARY.filter(w => {
    const t = parseTokens(w.word);
    return t.length >= 7 && t.length <= 12;
  });
  
  const solutionEntry = potentialSolutions[Math.floor(Math.random() * potentialSolutions.length)];
  const solutionWord = solutionEntry.word.toUpperCase();
  const solutionTokens = parseTokens(solutionWord);
  
  const usedWords = new Set<string>();
  usedWords.add(solutionWord);
  
  const rawRows: any[] = [];
  const allUsedTokens = new Set<string>(solutionTokens);
  
  // 2. Genereer horizontale rijen
  for (let i = 0; i < solutionTokens.length; i++) {
    const targetToken = solutionTokens[i];
    const candidates = VOCABULARY.filter(w => {
      const tokens = parseTokens(w.word);
      return tokens.includes(targetToken) && !usedWords.has(w.word.toUpperCase());
    });

    const scoredCandidates = candidates.map(c => {
      const tokens = parseTokens(c.word);
      const indices: number[] = [];
      tokens.forEach((t, idx) => { if (t === targetToken) indices.push(idx); });
      const middleIdx = (tokens.length - 1) / 2;
      let bestIdxInWord = indices[0];
      let minDistanceToMiddle = Math.abs(indices[0] - middleIdx);
      for (const idx of indices) {
        if (Math.abs(idx - middleIdx) < minDistanceToMiddle) {
          minDistanceToMiddle = Math.abs(idx - middleIdx);
          bestIdxInWord = idx;
        }
      }
      const lengthBonus = tokens.length * 0.15;
      return { entry: c, score: minDistanceToMiddle - lengthBonus, bestIdxInWord, tokens };
    });

    scoredCandidates.sort((a, b) => a.score - b.score);

    if (scoredCandidates.length > 0) {
      const poolSize = Math.min(5, scoredCandidates.length);
      const best = scoredCandidates[Math.floor(Math.random() * poolSize)];
      usedWords.add(best.entry.word.toUpperCase());
      best.tokens.forEach(t => allUsedTokens.add(t));
      rawRows.push({
        id: `row-${i}-${best.entry.word}`,
        word: best.entry.word.toUpperCase(),
        tokens: best.tokens,
        definition: best.entry.definition,
        solutionIndex: best.bestIdxInWord
      });
    }
  }

  // 3. Wijs unieke nummers toe aan alle unieke tekens
  const uniqueTokens = Array.from(allUsedTokens).sort();
  const shuffledNumbers = Array.from({ length: uniqueTokens.length }, (_, i) => i + 1)
    .sort(() => Math.random() - 0.5);

  const tokenToNumber: Record<string, number> = {};
  const numberToToken: Record<number, string> = {};
  
  uniqueTokens.forEach((token, index) => {
    const num = shuffledNumbers[index];
    tokenToNumber[token] = num;
    numberToToken[num] = token;
  });

  // 4. Bepaal welke specifieke vakjes een nummer tonen
  const forcedNumbers = new Set<string>(); // "row-col" strings
  const allPositions: {rIdx: number, cIdx: number, token: string}[] = [];
  rawRows.forEach((r, rIdx) => {
    r.tokens.forEach((t: string, cIdx: number) => {
      allPositions.push({rIdx, cIdx, token: t});
    });
  });
  
  // Garandeer dat elk token minstens 1x voorkomt
  uniqueTokens.forEach(token => {
    const pos = allPositions.find(p => p.token === token);
    if (pos) forcedNumbers.add(`${allPositions.indexOf(pos)}`);
  });

  const rows: PuzzleRow[] = rawRows.map((r, rIdx) => ({
    ...r,
    tokenNumbers: r.tokens.map((t: string, cIdx: number) => {
      // Gebruik de density parameter voor de kans op een cijfer
      const isForced = Array.from(forcedNumbers).some(idxStr => {
          const idx = parseInt(idxStr);
          const p = allPositions[idx];
          return p.rIdx === rIdx && p.cIdx === cIdx;
      });
      if (isForced) return tokenToNumber[t];
      return Math.random() < density ? tokenToNumber[t] : null;
    }),
    displayOffset: 0
  }));
  
  return {
    solutionWord,
    solutionDefinition: solutionEntry.definition,
    solutionTokens,
    rows,
    tokenToNumber,
    numberToToken
  };
};
