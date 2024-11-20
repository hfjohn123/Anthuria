import objIsEmpty from '../../../../common/objIsEmpty.ts';
import EvidenceModal from '../EvidenceModal.tsx';
import { SLPItem_General } from '../../../../types/MDSFinal.ts';

export default function SLPDetail({ data }: { data: SLPItem_General }) {
  return (
    <p>
      {objIsEmpty(data) ? (
        'No Record'
      ) : (
        <>
          <span>{data.is_mds ? 'Is in MDS Table' : 'Not in MDS Table'}</span>
          {data.is_suggest ? (
            <>
              {' '}
              <EvidenceModal
                icd10={{
                  icd10: 'Suggestion',
                  progress_note: data.slp_entry,
                  is_thumb_up: null, // or some default value
                  comment: null, // or some default value
                }}
              />
            </>
          ) : null}
        </>
      )}
    </p>
  );
}
