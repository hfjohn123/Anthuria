import highlightGenerator from '../../common/highlightGenerator.ts';

export default function HighlightWrapper({
  text,
  searchTerm,
}: {
  text: string;
  searchTerm: string;
}) {
  return highlightGenerator(text, [searchTerm]).map((segment, index) => (
    <span
      key={index}
      className={
        segment.isMatch && segment.termIndex !== undefined
          ? `bg-yellow-200 px-1 rounded`
          : ''
      }
      title={segment.isMatch ? `Match: ${segment.term}` : undefined}
    >
      {segment.text}
    </span>
  ));
}
