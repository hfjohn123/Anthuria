import { faker } from '@faker-js/faker';

export type MDSFinal = {
  patient_id: string;
  patient_name: string;
  internal_facility_id: string;
  facility_name: string;
  upstream: string;
  update_time: Date;
  function_score: number;
  existing_icd10: string[];
  new_icd10: ICD10[];
};

type ICD10 = {
  icd10: string;
  old_icd10?: string;
  progress_note: ProgressNoteAndSummary[];
  is_thumb_up: boolean;
  comment: string;
};

type ProgressNoteAndSummary = {
  progress_note: string;
  summary: string;
};

function generateRandomICD10(): MDSFinal {
  const icd10 = faker.helpers.arrayElement([
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
  ]);

  return {
    patient_id: faker.number
      .int({ min: 1000000000, max: 9999999999 })
      .toString(),
    patient_name: faker.person.fullName(),
    internal_facility_id: faker.string.uuid(),
    facility_name: faker.company.name(),
    upstream: 'MTX',
    update_time: new Date(),
    function_score: faker.number.int({ min: 0, max: 100 }),
    existing_icd10: Array.from(
      { length: faker.number.int({ min: 40, max: 40 }) },
      () => icd10,
    ),
    new_icd10: [
      {
        icd10: icd10,
        old_icd10: 'B00-B09',
        progress_note: [
          {
            progress_note: faker.lorem.paragraph(),
            summary: faker.lorem.paragraph(),
          },
        ],
        is_thumb_up: faker.datatype.boolean(),
        comment: faker.lorem.paragraph(),
      },
    ],
  };
}
export function generateMDSData(count: number): MDSFinal[] {
  return Array.from({ length: count }, generateRandomICD10);
}
