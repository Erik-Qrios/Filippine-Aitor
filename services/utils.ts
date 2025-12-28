export const parseTokens = (text: string): string[] => {
  const result: string[] = [];
  // Clean text of common noise if any
  const cleaned = text.replace(/[\s\.\-]/g, '');
  const chars = cleaned.split('');
  
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const next = chars[i+1];
    
    // Handle 'IJ' digraph common in Dutch crosswords
    if (c.toLowerCase() === 'i' && next && next.toLowerCase() === 'j') {
      result.push('IJ');
      i++;
    } else {
      const upper = c.toUpperCase();
      // Only add if it's a valid letter
      if (/[A-Z]/.test(upper)) {
        result.push(upper);
      }
    }
  }
  return result;
};