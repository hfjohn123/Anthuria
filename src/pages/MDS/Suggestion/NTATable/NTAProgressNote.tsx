import { ProgressNoteAndSummary } from '../../../../types/MDSFinal.ts';
import LineClampShowMore from '../../../../common/LineClampShowMore.tsx';
import highlightColors from '../../../../common/highlightColors.ts';
import highlightGenerator from '../../../../common/highlightGenerator.ts';

export default function NTAProgressNote({
  progress_note,
}: {
  progress_note: ProgressNoteAndSummary;
}) {
  const searchTerms = progress_note.highlights?.split('|').filter(Boolean);

  if (!searchTerms?.length) {
    return <div className="p-4">{progress_note.progress_note}</div>;
  }

  return (
    <LineClampShowMore className="whitespace-pre-wrap" maxLines={6}>
      {highlightGenerator(progress_note.progress_note, searchTerms).map(
        (segment, index) => (
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
        ),
      )}
    </LineClampShowMore>
  );
}
