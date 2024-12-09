import NursingTableWrapper from './NursingTableWrapper.tsx';

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
export default function ClinicallyComplex() {
  return <NursingTableWrapper data={clinicallyComplex} />;
}
