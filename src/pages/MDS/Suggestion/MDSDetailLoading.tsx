import MDSDetail from './MDSDetail.tsx';
import { Row } from '@tanstack/react-table';
import { PDPMPatient } from '../../../types/MDSFinal.ts';
import { createContext, memo } from 'react';

export const MDSPatientContext = createContext<PDPMPatient>({
  nta_touched: 0,
  nursing_touched: 0,
  pt_touched: 0,
  slp_touched: 0,
  any_touched: 0,
  mds_hipps: '',
  original_nta_opportunities: 0,
  original_nta_suggestions: 0,
  original_nursing_opportunities: 0,
  original_nursing_suggestions: 0,
  original_ot_opportunities: 0,
  original_pt_opportunities: 0,
  original_ptot_opportunities: 0,
  original_ptot_suggestions: 0,
  original_slp_opportunities: 0,
  original_slp_suggestions: 0,
  original_total_opportunities: 0,
  internal_facility_id: '',
  internal_patient_id: '',
  patient_id: '',
  effective_start_date: new Date(),
  patient_name: '',
  facility_name: '',
  upstream: '',
  operation_name: '',
  url_header: '',
  mds_nta_group: '',
  mds_nta_cmi: 0,
  mds_nta_pay: 0,
  suggest_nta_group: '',
  suggest_nta_cmi: 0,
  suggest_nta_pay: 0,
  n_nta_suggestion: 0,
  mds_slp_group: '',
  mds_slp_cmi: 0,
  mds_slp_pay: 0,
  suggest_slp_group: '',
  suggest_slp_cmi: 0,
  suggest_slp_pay: 0,
  n_slp_suggestion: 0,
  mds_pt_group: '',
  mds_pt_cmi: 0,
  mds_pt_pay: 0,
  suggest_pt_group: '',
  suggest_pt_cmi: 0,
  suggest_pt_pay: 0,
  n_pt_suggestion: 0,
  mds_ot_group: '',
  mds_ot_cmi: 0,
  mds_ot_pay: 0,
  suggest_ot_group: '',
  suggest_ot_cmi: 0,
  suggest_ot_pay: 0,
  n_ot_suggestion: 0,
  mds_nursing_group: '',
  mds_nursing_cmi: 0,
  mds_nursing_pay: 0,
  suggest_nursing_group: '',
  suggest_nursing_cmi: 0,
  suggest_nursing_pay: 0,
  n_nursing_suggestion: 0,
  ptot_fs: 0,
  nursing_fs: 0,
  suggest_hipps: '',
  mds_nta_score: 0,
  suggest_nta_score: 0,
  mds_slp_s_count: 0,
  suggest_slp_s_count: 0,
  mds_slp_f_count: 0,
  suggest_slp_f_count: 0,
});
const MemoizedMDSDetail = memo(MDSDetail, (prevProps, nextProps) => {
  // Custom comparison logic
  return (
    prevProps.row.original.internal_patient_id ===
    nextProps.row.original.internal_patient_id
  );
  // Add more specific comparisons as needed
});

export default function MDSDetailLoading({ row }: { row: Row<PDPMPatient> }) {
  return (
    <MDSPatientContext.Provider value={row.original}>
      <MemoizedMDSDetail row={row} />
    </MDSPatientContext.Provider>
  );
}
