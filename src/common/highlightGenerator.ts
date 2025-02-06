import stemFiltering from './stemFiltering.ts';

export default function highlightGenerator(
  text: string,
  searchTerms: string[],
  numberCard?: boolean[],
) {
  const findMatches = () => {
    let segments: {
      text: string;
      isMatch: boolean;
      term: string | null;
      termIndex?: number;
    }[] = [
      {
        text: text,
        isMatch: false,
        term: null,
        termIndex: 0,
      },
    ];

    searchTerms.forEach((searchTerm, termIndex) => {
      if (!searchTerm.trim()) return;

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

        // Split text into segments at sentence boundaries or line breaks
        const regex = new RegExp(
          '([^.\\n]+(?:\\.(?!\\s*[A-Z])[^.\\n]*)*[^.\\n]*(?:\\.|$|\\n))',
          'gi',
        );

        const text = segment.text;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
          const matchedText = match[0]; // Changed from match[1] to match[0]

          // Use stemFiltering to check for matches
          if (stemFiltering(matchedText, searchTerm)) {
            // Add non-matching text before match
            if (match.index > lastIndex) {
              newSegments.push({
                text: text.slice(lastIndex, match.index),
                isMatch: false,
                term: null,
              });
            }

            // Add matching text
            newSegments.push({
              text: matchedText,
              isMatch: true,
              term: searchTerm,
              termIndex,
            });

            lastIndex = match.index + matchedText.length;
          } else {
            // If no match, add as non-matching segment
            if (match.index > lastIndex) {
              newSegments.push({
                text: text.slice(lastIndex, match.index),
                isMatch: false,
                term: null,
              });
            }
            newSegments.push({
              text: matchedText,
              isMatch: false,
              term: null,
            });
            lastIndex = match.index + matchedText.length;
          }
        }

        // Add remaining non-matching text
        if (lastIndex < text.length) {
          newSegments.push({
            text: text.slice(lastIndex),
            isMatch: false,
            term: null,
          });
        }
      });

      segments = newSegments;
    });

    return segments;
  };

  return findMatches();
}
