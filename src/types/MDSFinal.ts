import { faker } from '@faker-js/faker';

export type MDSFinal = {
  patient_id: string;
  patient_name: string;
  internal_facility_id: string;
  facility_name: string;
  upstream: string;
  update_time: Date;
  nta_score: number;
  nta_group: string;
  nta_score_gap_score: number;
  nta_score_recommendation: number;
  nta_group_recommendation: string;
  existing_icd10: string[];
  new_nta_icd10: NTAICD10[];
};

export type NTAICD10 = {
  icd10: string;
  comorbidity: string;
  progress_note: ProgressNoteAndSummary[];
  is_thumb_up: boolean;
  comment: string;
};

export type ProgressNoteAndSummary = {
  highlights: string;
  progress_note: string;
  explanation: string;
};

function generateRandomICD10(): MDSFinal {
  const icd10 = [
    'A00-A09',
    'A10-A19',
    'A20-A28',
    'A30-A49',
    'A50-A64',
    'A65-A69',
    'A70-A79',
    'A80-A89',
    'A90-A99',
    'B00-B09',
    'B10-B19',
    'B20-B29',
    'B30-B39',
    'B40-B49',
    'B50-B59',
    'B60-B69',
    'B70-B79',
    'B80-B89',
  ];

  return {
    patient_id: faker.number
      .int({ min: 1000000000, max: 9999999999 })
      .toString(),
    patient_name: faker.person.fullName(),
    internal_facility_id: faker.string.uuid(),
    facility_name: faker.company.name(),
    upstream: 'MTX',
    update_time: faker.date.anytime(),
    nta_score: faker.number.int({ min: 0, max: 100 }),
    nta_group: faker.helpers.arrayElement([
      'Low',
      'Medium',
      'High',
      'Very High',
      'Extremely High',
    ]),
    nta_score_gap_score: faker.number.int({ min: 0, max: 100 }),
    nta_score_recommendation: faker.number.int({ min: 0, max: 100 }),
    nta_group_recommendation: faker.helpers.arrayElement([
      'Low',
      'Medium',
      'High',
      'Very High',
      'Extremely High',
    ]),
    existing_icd10: faker.helpers.arrayElements(
      icd10,
      faker.number.int({ min: 0, max: 9 }),
    ),
    new_nta_icd10: Array.from(
      { length: faker.number.int({ min: 1, max: 9 }) },
      () => ({
        icd10: faker.helpers.arrayElement(icd10),
        comorbidity: faker.lorem.word(),

        progress_note: faker.helpers.uniqueArray(
          () => ({
            highlights: faker.lorem.sentence(),
            progress_note: faker.lorem.paragraph(),
            explanation: faker.lorem.paragraph(),
          }),
          faker.number.int({ min: 1, max: 5 }),
        ),
        is_thumb_up: faker.datatype.boolean(),
        comment: faker.lorem.paragraph(),
      }),
    ),
  };
}
export function generateMDSData(count: number): MDSFinal[] {
  return Array.from({ length: count }, generateRandomICD10);
}
