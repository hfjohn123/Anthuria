import NursingTableWrapper from './NursingTableWrapper.tsx';
import { NursingCC } from '../../../../types/MDSFinal.ts';
import _ from 'lodash';

const extensiveServices = [
  { mds_item: 'O0110E1B', description: 'Tracheostomy care while a resident' },
  {
    mds_item: 'O0110F1B',
    description: 'Ventilator or respirator while a resident',
  },
  {
    mds_item: 'O0110M1B',
    description:
      'Isolation or quarantine for active infectious disease while resident',
  },
];
const specialCareHigh = [
  {
    mds_item: 'B0100, Section GG items',
    description:
      'Comatose and completely dependent or activity did not occur at admission (GG0130A1, GG0130C1, GG0170B1, GG0170C1, GG0170D1, GG0170E1, and GG0170F1, all equal 01, 09, or 88)',
  },
  { mds_item: 'I2100', description: 'Septicemia' },
  {
    mds_item: 'I2900, N0350A,B',
    description:
      'Diabetes with both of the following: Insulin injections (N0350A) for all 7 days Insulin order changes on 2 or more days (N0350B)',
  },
  {
    mds_item: 'I5100, Nursing Function Score',
    description: 'Quadriplegia with Nursing Function Score <= 11',
  },
  {
    mds_item: 'I6200, J1100C',
    description:
      'Chronic obstructive pulmonary disease and shortness of breath when lying flat',
  },
  {
    mds_item: 'J1550A Fever and others',
    description:
      'J1550A Fever and others (one of the following):\n' +
      'I2000 Pneumonia\n' +
      'J1550B Vomiting\n' +
      'K0300 Weight loss (1 or 2)\n' +
      'K0520B2 or K0520B3 Feeding tube*',
  },
  {
    mds_item: 'K0520A2 or K0520A3',
    description: 'Parenteral/IV feedings',
  },
  {
    mds_item: 'O0400D2',
    description: 'Respiratory therapy for all 7 days',
  },
];
const specialCareLow = [
  {
    mds_item: 'I4400, Nursing Function Score',
    description: 'Cerebral palsy, with Nursing Function Score <=11',
  },
  {
    mds_item: 'I5200, Nursing Function Score',
    description: 'Multiple sclerosis, with Nursing Function Score <=11',
  },
  {
    mds_item: 'I5300, Nursing Function Score',
    description: "Parkinson's disease, with Nursing Function Score <=11",
  },
  {
    mds_item: 'I6300, O0110C1B',
    description: 'Respiratory failure and oxygen therapy while a resident',
  },
  {
    mds_item: 'K0520B2 or K0520B3',
    description: 'Feeding tube*',
  },
  {
    mds_item: 'M0300B1',
    description:
      'Two or more stage 2 pressure ulcers with two or more selected skin treatments**',
  },
  {
    mds_item: 'M0300C1,D1,F1',
    description:
      'Any stage 3 or 4 pressure ulcer with two or more selected skin treatments**',
  },
  {
    mds_item: 'M1030',
    description:
      'Two or more venous/arterial ulcers with two or more selected skin treatments**',
  },
  {
    mds_item: 'M0300B1, M1030',
    description:
      '1 stage 2 pressure ulcer and 1 venous/arterial ulcer with 2 or more selected skin treatments**',
  },
  {
    mds_item: 'M1040A,B,C; M1200I',
    description:
      'Foot infection, diabetic foot ulcer or other open lesion of foot with application of dressings to the feet',
  },
  {
    mds_item: 'O0110B1B',
    description: 'Radiation treatment while a resident',
  },
  {
    mds_item: 'O0110J1B',
    description: 'Dialysis treatment while a resident',
  },
];
const clinicallyComplex = [
  { mds_item: 'I2000', description: 'Pneumonia' },
  {
    mds_item: 'I4900, Nursing Function Score',
    description: 'Hemiplegia/hemiparesis with Nursing Function Score <= 11',
  },
  {
    mds_item: 'M1040D,E',
    description:
      'Open lesions (other than ulcers, rashes, and cuts) with any selected skin treatment* or surgical wounds',
  },
  {
    mds_item: 'M1040F',
    description: 'Burns',
  },
  {
    mds_item: 'O0110A1B',
    description: 'Chemotherapy while a resident',
  },
  {
    mds_item: 'O0110C1B',
    description: 'Oxygen Therapy while a resident',
  },
  {
    mds_item: 'O0110H1B',
    description: 'IV Medications while a resident',
  },
  {
    mds_item: 'O0110I1B',
    description: 'Transfusions while a resident',
  },
];
const staffCognitive = [
  {
    mds_item: 'B0100',
    description:
      'Coma (B0100 = 1) and completely dependent or activity did not occur at admission (GG0130A1, GG0130C1, GG0170B1, GG0170C1, GG0170D1, GG0170E1, and GG0170F1 all equal 01, 09, or 88)',
  },
  {
    mds_item: 'C1000',
    description:
      'Severely impaired cognitive skills for daily decision making (C1000 = 3)',
  },
  {
    mds_item: 'B0700-C1000',
    description: (
      <span>
        <b>Both conditions met:</b>
        <br />
        <br />
        <b>
          Two or more of the following impairment indicators are present (B0700,
          C0700, C1000):
        </b>
        <br />
        B0700 &gt; 0 Usually, sometimes, or rarely/never understood
        <br />
        C0700 = 1 Short-term memory problem
        <br />
        C1000 &gt; 0 Impaired cognitive skills for daily decision making
        <br />
        <b>
          One or more of the following severe impairment indicators are present
          (B0700, C1000):
        </b>
        <br />
        B0700 &gt;= 2 Sometimes or rarely/never makes self understood
        <br />
        C1000 &gt;= 2 Moderately or severely impaired cognitive skills for daily
        decision making
      </span>
    ),
  },
];
const behavioralSymptoms = [
  {
    mds_item: 'E0100A',
    description: 'Hallucinations',
  },
  {
    mds_item: 'E0100B',
    description: 'Delusions',
  },
  {
    mds_item: 'E0200A',
    description: 'Physical behavioral symptoms directed toward others (2 or 3)',
  },
  {
    mds_item: 'E0200B',
    description: 'Verbal behavioral symptoms directed toward others (2 or 3)',
  },
  {
    mds_item: 'E0200C',
    description:
      'Other behavioral symptoms not directed toward others (2 or 3)',
  },
  {
    mds_item: 'E0800',
    description: 'Rejection of care (2 or 3)',
  },
  {
    mds_item: 'E0900',
    description: 'Wandering (2 or 3)',
  },
];
type NursingType =
  | 'extensiveServices'
  | 'specialCareHigh'
  | 'specialCareLow'
  | 'clinicallyComplex'
  | 'Staff assessment cognitive status'
  | 'Behavioral symptoms';

const typeMap: Record<
  NursingType,
  { mds_item: string; description: string | JSX.Element }[]
> = {
  extensiveServices,
  specialCareHigh,
  specialCareLow,
  clinicallyComplex,
  'Staff assessment cognitive status': staffCognitive,
  'Behavioral symptoms': behavioralSymptoms,
};

export default function ClinicalCategory({
  data,
  type,
}: {
  data?: NursingCC[];
  type: NursingType;
}) {
  const joined = _.merge(
    {},
    _.keyBy(typeMap[type], 'mds_item'),
    _.keyBy(data, 'mds_item'),
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="font-semibold">
        {type !== 'Staff assessment cognitive status' &&
        type !== 'Behavioral symptoms'
          ? 'Clinical Category'
          : type}
        : {data ? 'Yes' : 'No'}
      </p>
      <NursingTableWrapper data={_.values(joined)} />
    </div>
  );
}
