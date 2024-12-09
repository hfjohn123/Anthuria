import NursingTableWrapper from './NursingTableWrapper.tsx';

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

export default function SpecialCareLow() {
  return <NursingTableWrapper data={specialCareLow} />;
}
