import { ProgressNoteAndSummary } from '../../../../types/MDSFinal.ts';
import LineClampShowMore from '../../../../common/LineClampShowMore.tsx';
import highlightColors from '../../../../common/highlightColors.ts';

export default function NTAProgressNote({
  progress_note,
}: {
  progress_note: ProgressNoteAndSummary;
}) {
  const searchTerms = progress_note.highlights?.split('|').filter(Boolean);

  if (!searchTerms?.length) {
    return <div className="p-4">{progress_note.progress_note}</div>;
  }

  const findMatches = () => {
    let segments: {
      text: string;
      isMatch: boolean;
      term: string | null;
      termIndex?: number;
    }[] = [
      {
        text: progress_note.progress_note,
        isMatch: false,
        term: null,
        termIndex: 0,
      },
    ];

    searchTerms.forEach((term, termIndex) => {
      if (!term.trim()) return;

      const regex = new RegExp(`(${term})`, 'gi');
      const newSegments: {
        text: string;
        isMatch: boolean;
        term: string | null;
        termIndex?: number;
      }[] = [];

      segments.forEach((segment) => {
        if (segment.isMatch) {
          newSegments.push(segment);
          return;
        }

        const parts = segment.text.split(regex);
        parts.forEach((part) => {
          if (part.toLowerCase() === term.toLowerCase()) {
            newSegments.push({
              text: part,
              isMatch: true,
              term: term,
              termIndex,
            });
          } else if (part) {
            newSegments.push({
              text: part,
              isMatch: false,
              term: null,
            });
          }
        });
      });

      segments = newSegments;
    });

    return segments;
  };

  const segments = findMatches();
  return (
    <LineClampShowMore className="whitespace-pre-wrap" maxLines={6}>
      {segments.map((segment, index) => (
        <span
          key={index}
          className={
            segment.isMatch && segment.termIndex !== undefined
              ? `${highlightColors[segment.termIndex % highlightColors.length]} px-1 rounded`
              : ''
          }
          title={segment.isMatch ? `Match: ${segment.term}` : undefined}
        >
          {segment.text}
        </span>
      ))}
    </LineClampShowMore>
  );
}
