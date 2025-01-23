import { NursingDepreation } from '../../../../types/MDSFinal.ts';
import EvidenceModal from '../EvidenceModal.tsx';

export default function DepressionIndicator({
  data,
}: {
  data: NursingDepreation;
}) {
  return (
    <div>
      <p className="font-bold">Depression Indicator:</p>
      {data.is_mds_table === undefined ? (
        <p>No Record Found</p>
      ) : (
        <p>
          {data.is_mds_table ? 'Yes' : 'No'}{' '}
          {data.suggestion && data.suggestion.length > 0 ? (
            <EvidenceModal
              button={
                <span>
                  (AI suggests with {data.suggestion.length}{' '}
                  {data.suggestion.length === 1 ? 'potential' : 'potentials'})
                </span>
              }
              icd10={{
                icd10: 'Depression',
                progress_note: data.suggestion,
              }}
            />
          ) : null}
        </p>
      )}
    </div>
  );
}
