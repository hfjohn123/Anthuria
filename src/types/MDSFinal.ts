// import { faker } from '@faker-js/faker';

export type PDPMPatient = {
  internal_facility_id: string;
  internal_patient_id: string;
  patient_id: string;
  effective_start_date: Date;
  patient_name: string;
  facility_name: string;
  upstream: string;
  operation_name: string;
  url_header: string;
  mds_nta_group: string;
  mds_nta_cmi: number;
  mds_nta_pay: number;
  suggest_nta_group: string;
  suggest_nta_cmi: number;
  suggest_nta_pay: number;
  n_nta_suggestion: number;
  mds_slp_group: string;
  mds_slp_cmi: number;
  mds_slp_pay: number;
  suggest_slp_group: string;
  suggest_slp_cmi: number;
  suggest_slp_pay: number;
  n_slp_suggestion: number;
  mds_pt_group: string;
  mds_pt_cmi: number;
  mds_pt_pay: number;
  suggest_pt_group: string;
  suggest_pt_cmi: number;
  suggest_pt_pay: number;
  n_pt_suggestion: number;
  mds_ot_group: string;
  mds_ot_cmi: number;
  mds_ot_pay: number;
  suggest_ot_group: string;
  suggest_ot_cmi: number;
  suggest_ot_pay: number;
  n_ot_suggestion: number;
  mds_nursing_group: string;
  mds_nursing_cmi: number;
  mds_nursing_pay: number;
  suggest_nursing_group: string;
  suggest_nursing_cmi: number;
  suggest_nursing_pay: number;
  n_nursing_suggestion: number;
  original_nta_suggestions?: number;
  original_slp_suggestions?: number;
  original_ptot_suggestions?: number;
  original_nursing_suggestions?: number;
  original_nta_opportunities?: number;
  original_slp_opportunities?: number;
  original_pt_opportunities?: number;
  original_ot_opportunities?: number;
  original_ptot_opportunities?: number;
  original_nursing_opportunities?: number;
  original_total_opportunities?: number;
  ptot_fs: number;
  nursing_fs: number;
  mds_hipps?: string;
  suggest_hipps: string;
  mds_nta_score: number;
  suggest_nta_score: number;
  mds_slp_s_count: number;
  suggest_slp_s_count: number;
  mds_slp_f_count: number;
  suggest_slp_f_count: number;
  nta_touched: number;
  slp_touched: number;
  pt_touched: number;
  nursing_touched: number;
  any_touched: number;
};

export type MDSFinal = {
  patient_id: string;
  patient_name: string;
  internal_facility_id: string;
  internal_patient_id: string;
  facility_name: string;
  upstream: string;
  update_time: Date;
  effective_start_date: Date;
  nta_final_entry: NTAEntry[];
  slp_final_entry: SLPItem[];
  ptot_final_entry: PTOTFinal;
  nursing_fa_final_entry: NursingFunctionalScore;
  nursing_re_final_entry: RestorativeNursing;
  operation_name: string;
  url_header: string;
  nursing_d_final_entry: NursingDepreation;
  nursing_cc_final_entry: {
    nursing_mds_item_sch?: NursingCC[];
    nursing_mds_item_cc?: NursingCC[];
    nursing_mds_item_scl?: NursingCC[];
    nursing_mds_item_es?: NursingCC[];
  };
  nursing_bscp_final_entry: {
    nursing_bscp_bims?: NursingBIMS;
    nursing_bscp_mds_sacs?: NursingBSCP[];
    nursing_bscp_mds_bs?: NursingBSCP[];
  };
  hipps: string | null;
  nursing_group: string | null;
};

export type NTAEntry = {
  comorbidity: string;
  is_mds_table: number;
  mds_item: string;
  score: number;
  suggestion?: SuggestedICD10[];
  is_thumb_up: number | null;
  is_thumb_down: number | null;
  comment: string | null;
  category: string;
  item: string;
};

export type SLPItem = {
  category: string;
  item: string;
  is_mds_table: number;
  is_thumb_up: number | null;
  is_thumb_down: number | null;
  comment: string | null;
  condition: string;
} & (
  | {
      item: 'ci' | 'mad' | 'sd' | 'anc';
      suggestion?: ProgressNoteAndSummary[];
    }
  | {
      item: 'cp';
      suggestion?: SLPEntry[];
    }
);

export type SuggestedICD10 = {
  icd10: string;
  progress_note: ProgressNoteAndSummary[];
};

export type SLPEntry = {
  comorbidity: string;
  suggestion: SuggestedICD10[];
};

export type ProgressNoteAndSummary = {
  source_id: number;
  source_category: string;
  update_time: Date;
  highlights?: string;
  progress_note?: string;
  explanation: string;
};

export type PTOTFinal = {
  clinical_category?: string;
  mix_group?: string;
  final_score?: string;
  function_score_all?: FunctionalScore[];
};

export type FunctionalScore = {
  function_area: string;
  mds_item: string;
  individual_function_score: string | null;
  suggest_individual_function_score: string | null;
  suggest_average_function_score: string | null;
  suggestion?: ProgressNoteAndSummary[];
  average_function_score: string | null;
  is_thumb_up: number;
  is_thumb_down: number;
  comment: string;
  category: string;
  item: string;
};

export type NursingFunctionalScore = {
  final_score?: string;
  function_score_all?: FunctionalScore[];
};

export type RestorativeNursing =
  | {
      final_count?: undefined;
      restorative_count_all?: never;
    }
  | {
      final_count: number;
      restorative_count_all: RestorativeCountAll[];
    };

export type RestorativeCountAll = {
  mds_item: string;
  suggestion: [];
  is_thumb_up: boolean;
  comment: string;
};

export type NursingDepreation =
  | {
      is_mds_table: number;
      suggestion: ProgressNoteAndSummary[] | null;
      is_thumb_up: number | null;
      is_thumb_down: number | null;
      comment: string | null;
    }
  | {
      is_mds_table?: undefined;
      suggestion: undefined;
      is_thumb_up: undefined;
      is_thumb_down: undefined;
      comment: undefined;
    };

export type NursingCC = {
  mds_item: string;
  is_mds: boolean;
  nursing_mds_suggestion: SuggestedICD10[];
  is_thumb_up: boolean | null;
  comment: string | null;
};

export type NursingBIMS = {
  mds_value: string;
  nursing_bscp_suggestion: ProgressNoteAndSummary[];
  is_thumb_up: boolean | null;
  comment: string | null;
};

export type NursingBSCP = {
  mds_item: string;
  is_mds: boolean;
  nursing_bscp_suggestion: ProgressNoteAndSummary[];
  is_thumb_up: boolean | null;
  comment: string | null;
};
