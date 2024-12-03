import stemFiltering from './stemFiltering.ts';

export default function highlightGenerator(
  text: string,
  searchTerms: string[],
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

        // Create regex pattern from search term
        const escapedTerm = searchTerm
          .replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
          .replace(/\s+/g, '\\s+');
        const regex = new RegExp(`(${escapedTerm})`, 'gi');

        const text = segment.text;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
          // Verify match with stemming
          if (stemFiltering(match[0], searchTerm)) {
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
              text: match[0],
              isMatch: true,
              term: searchTerm,
              termIndex,
            });

            lastIndex = match.index + match[0].length;
          }
          // Prevent infinite loop for zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
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
