// import { faker } from '@faker-js/faker';

export type MDSFinal = {
  patient_id: string;
  patient_name: string;
  internal_facility_id: string;
  facility_name: string;
  upstream: string;
  update_time: Date;
  nta_final_entry: NTAEntry[];
  slp_final_entry: (SLPItem_General | SLPItem_comorbidities_present)[];
  ptot_final_entry: PTOTFinal;
};

export type NTAEntry = {
  comorbidity: string;
  is_mds_table: boolean;
  mds_item: string;
  score: number;
  update_time: Date;
  new_icd10?: SuggestedICD10[];
};

export type SLPItem_General = {
  condition:
    | 'Cognitive Impairment'
    | 'Acute Neurologic Condition'
    | 'Mechanically Altered Diet'
    | 'Swallowing Disorder';
  is_mds?: boolean;
  is_suggest?: boolean;
  slp_entry?: ProgressNoteAndSummary[];
};

export type SLPItem_comorbidities_present = {
  condition: 'Comorbidities Present';
  is_mds?: boolean;
  is_suggest?: boolean;
  slp_entry?: SLPEntry[];
};

export type SuggestedICD10 = {
  icd10: string;
  progress_note: ProgressNoteAndSummary[];
  is_thumb_up: boolean | null;
  comment: string | null;
};

export type SLPEntry = {
  comorbidity: string;
  is_slp_table: boolean;
  new_icd10: SuggestedICD10[];
  update_time: Date;
};

export type ProgressNoteAndSummary = {
  source_id: number;
  source_category: string;
  update_time: Date;
  highlights?: string;
  progress_note: string;
  explanation: string;
};

export type PTOTFinal = {
  clinical_category?: string;
} & (
  | {
      mix_group: string;
      final_score: string;
      function_score_all: FunctionalScore[];
    }
  | {
      mix_group?: never;
      final_score?: never;
      function_score_all?: never;
    }
);

export type FunctionalScore = {
  function_area: string;
  mds_item: string;
  individual_function_score: string;
  suggestion: [];
  average_function_score: string;
  is_thumb_up: boolean;
  comment: string;
};

// function generateRandomICD10(): MDSFinal {
//   const icd10 = [
//     'A00-A09',
//     'A10-A19',
//     'A20-A28',
//     'A30-A49',
//     'A50-A64',
//     'A65-A69',
//     'A70-A79',
//     'A80-A89',
//     'A90-A99',
//     'B00-B09',
//     'B10-B19',
//     'B20-B29',
//     'B30-B39',
//     'B40-B49',
//     'B50-B59',
//     'B60-B69',
//     'B70-B79',
//     'B80-B89',
//   ];
//
//   return {
//     patient_id: faker.number
//       .int({ min: 1000000000, max: 9999999999 })
//       .toString(),
//     patient_name: faker.person.fullName(),
//     internal_facility_id: faker.string.uuid(),
//     facility_name: faker.company.name(),
//     upstream: 'MTX',
//     update_time: faker.date.anytime(),
//     nta_score: faker.number.int({ min: 0, max: 100 }),
//     nta_group: faker.helpers.arrayElement([
//       'Low',
//       'Medium',
//       'High',
//       'Very High',
//       'Extremely High',
//     ]),
//     nta_score_gap_score: faker.number.int({ min: 0, max: 100 }),
//     nta_score_recommendation: faker.number.int({ min: 0, max: 100 }),
//     nta_group_recommendation: faker.helpers.arrayElement([
//       'Low',
//       'Medium',
//       'High',
//       'Very High',
//       'Extremely High',
//     ]),
//     existing_icd10: faker.helpers.arrayElements(
//       icd10,
//       faker.number.int({ min: 0, max: 9 }),
//     ),
//     new_nta_icd10: Array.from(
//       { length: faker.number.int({ min: 1, max: 9 }) },
//       () => ({
//         icd10: faker.helpers.arrayElement(icd10),
//         comorbidity: faker.lorem.word(),
//
//         progress_note: faker.helpers.uniqueArray(
//           () => ({
//             highlights: faker.lorem.sentence(),
//             progress_note: faker.lorem.paragraph(),
//             explanation: faker.lorem.paragraph(),
//           }),
//           faker.number.int({ min: 1, max: 5 }),
//         ),
//         is_thumb_up: faker.datatype.boolean(),
//         comment: faker.lorem.paragraph(),
//       }),
//     ),
//   };
// }
// export function generateMDSData(count: number): MDSFinal[] {
//   return Array.from({ length: count }, generateRandomICD10);
// }
