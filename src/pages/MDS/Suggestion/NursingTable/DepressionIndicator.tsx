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
      {data.is_mds === undefined ? (
        <p>No Record Found</p>
      ) : (
        <p>
          {data.is_mds ? 'Yes' : 'No'}{' '}
          {data.is_suggest && (
            <EvidenceModal
              button={
                <span>
                  (AI suggests with {data.slp_entry.length}{' '}
                  {data.slp_entry.length === 1 ? 'potential' : 'potentials'})
                </span>
              }
              icd10={{
                icd10: 'Depression',
                progress_note: data.slp_entry,
                is_thumb_up: null, // or some default value
                comment: null, // or some default value
              }}
            />
          )}
        </p>
      )}
    </div>
  );
}
