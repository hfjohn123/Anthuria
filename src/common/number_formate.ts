export default function number_formate(d: number) {
  if (d < 1000) return '$' + d.toFixed(2);
  if (d < 1000000) return '$' + (d / 1000).toFixed(2) + 'K';
  if (d < 1000000000) return '$' + (d / 1000000).toFixed(2) + 'M';
  return '$' + (d / 1000000000).toFixed(2) + 'B';
}
