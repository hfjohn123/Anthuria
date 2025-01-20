import highlightGenerator from '../../common/highlightGenerator.ts';
import clsx from 'clsx';

export default function HighlightWrapper({
  text,
  searchTerm,
  className = '',
}: {
  text: string;
  searchTerm: string;
  className?: string;
}) {
  return highlightGenerator(text, [searchTerm]).map((segment, index) => (
    <span
      key={index}
      className={clsx(
        segment.isMatch && segment.termIndex !== undefined
          ? `bg-yellow-200 px-1 rounded`
          : '',
        className,
      )}
      title={segment.isMatch ? `Match: ${segment.term}` : undefined}
    >
      {segment.text}
    </span>
  ));
}
