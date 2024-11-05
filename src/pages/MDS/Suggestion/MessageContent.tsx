import { Citation } from '../../../types/ChatBot.ts';

interface CitationProps {
  content: string;
  citations?: Citation[];
}

export default function MessageContent({ content, citations }: CitationProps) {
  if (!citations) return <>{content}</>;

  // Track reference count to generate correct citation numbers
  let totalReferenceCount = 0;

  // Create citation markers with correct reference numbers
  const citationMarkers = citations.map((citation) => {
    const referenceCount = citation.retrievedReferences.length;
    const startNum = totalReferenceCount + 1;
    const numbers = Array.from(
      { length: referenceCount },
      (_, i) => startNum + i,
    );
    totalReferenceCount += referenceCount;

    return {
      position: citation.generatedResponsePart.textResponsePart.span.end,
      numbers: numbers,
    };
  });

  let lastIndex = 0;
  const parts = [];

  citationMarkers.forEach((marker, index) => {
    // Add text content without any extra space
    const textPart = content.slice(lastIndex, marker.position);
    parts.push(textPart);

    // Add citation numbers without margin
    parts.push(
      <sup key={`citation-${index}`} className="text-inherit font-medium">
        [{marker.numbers.join(',')}]
      </sup>,
    );

    lastIndex = marker.position;
  });

  // Add remaining content
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <>{parts}</>;
}
