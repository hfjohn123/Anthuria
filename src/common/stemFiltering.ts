import { stemmer } from 'stemmer';

export default function stemFiltering(
  value: string,
  filterValue: string,
): boolean {
  // Handle edge cases
  if (!value || !filterValue) {
    return false;
  }

  // Helper function to clean and stem text
  const processText = (text: string): string[] => {
    return text
      .trim()
      .replace(/[^\w\s]/gi, '') // Remove punctuation
      .toLowerCase()
      .split(/\s+/)
      .map(stemmer);
  };

  const valueWords = processText(value).filter((word) => word !== '');
  const filterWords = processText(filterValue).filter((word) => word !== '');
  if (valueWords.length === 0 || filterWords.length === 0) {
    return false;
  }
  // Handle single-word filter
  if (filterWords.length === 1) {
    return (
      value.trim().toLowerCase().includes(filterWords[0]) ||
      valueWords.some((word) => word === filterWords[0])
    );
  }

  // Handle multi-word filter
  if (filterWords.length > valueWords.length) {
    return false; // Filter is longer than value, no match possible
  }

  // Check for consecutive matches
  for (let i = 0; i <= valueWords.length - filterWords.length; i++) {
    let isMatch = true;
    for (let j = 0; j < filterWords.length; j++) {
      if (valueWords[i + j] !== filterWords[j]) {
        isMatch = false;
        break;
      }
    }
    if (isMatch) {
      return true;
    }
  }

  return false;
}
