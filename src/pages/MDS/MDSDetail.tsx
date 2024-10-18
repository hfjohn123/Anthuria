import { MDSFinal } from '../../types/MDSFinal.ts';
import { Row } from '@tanstack/react-table';
import MDSSuggestion from './MDSSuggestion.tsx';
import PatientInfo from './PatientInfo.tsx';

export default function MDSDetail({ row }: { row: Row<MDSFinal> }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 px-3 text-sm py-4 flex flex-col gap-5">
      <PatientInfo row={row} />
      <MDSSuggestion
        new_nta_icd10={row.original.new_nta_icd10}
        new_slp_icd10={row.original.new_slp_icd10}
        new_bims_icd10={row.original.new_bims_icd10}
        bims_score={row.original.bims_score}
      />
    </div>
  );
}
