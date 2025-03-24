/**
 * Normalizes a search string by:
 * 1. Converting to lowercase
 * 2. Removing diacritical marks (accents)
 * 3. Trimming whitespace
 */
export const normalizeText = (text) => {
    if (!text) return '';
    
    return text
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };