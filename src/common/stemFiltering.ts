import { stemmer } from 'stemmer';

export default function stemFiltering(value: string, filterValue: string) {
  const filterWords = filterValue
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(stemmer);
  const valueWords = value
    .replace(/[^\w\s]/gi, '') // Remove punctuation
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(stemmer);

  if (filterWords.length === 1) {
    return valueWords.some((valueWord) => valueWord === filterWords[0]);
  }
  const filterWord_rejoin = valueWords.join(' ');
  const valueWords_rejoin = filterWords.join(' ');
  return valueWords_rejoin.includes(filterWord_rejoin);
}
