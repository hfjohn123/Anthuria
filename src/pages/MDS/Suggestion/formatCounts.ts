import _ from 'lodash';

type KnownKeys = 'P' | 'A' | 'D';

// Define the type for the input object
type CountObject = Partial<Record<KnownKeys, number>> & {
  [key: string]: number | undefined;
};

type TermMapping = {
  singular: string;
  plural: string;
};

const termMappings: Record<string, TermMapping> = {
  P: { singular: 'Progress Note', plural: 'Progress Notes' },
  A: { singular: 'Assessment', plural: 'Assessments' },
  D: { singular: 'Diagnosis', plural: 'Diagnoses' },
};

export default function formatCounts(counts: CountObject): string {
  // Partition entries into known and unknown
  const [knownEntries, unknownEntries] = _.partition(
    Object.entries(counts),
    ([key]) => key in termMappings,
  );

  // Format known terms
  const formattedTerms = knownEntries.map(([key, count]) => {
    const term = termMappings[key];
    return `${count} ${count === 1 ? term.singular : term.plural}`;
  });

  // Calculate others count
  const othersCount = _.sum(unknownEntries.map(([, count]) => count));

  // Handle cases with no items
  if (formattedTerms.length === 0) {
    return othersCount > 0 ? `${othersCount} others` : '';
  }

  // Build the final string
  let result = '';

  if (formattedTerms.length === 1) {
    result = formattedTerms[0];
  } else {
    result =
      formattedTerms.slice(0, -1).join(', ') + ` and ${_.last(formattedTerms)}`;
  }

  // Add others if present
  if (othersCount > 0) {
    result += result ? ` and ${othersCount} others` : `${othersCount} others`;
  }

  return '(' + result + ' detected)';
}
