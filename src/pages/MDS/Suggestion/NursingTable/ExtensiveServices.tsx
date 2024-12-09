import NursingTableWrapper from './NursingTableWrapper.tsx';

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

export default function ExtensiveServices() {
  return <NursingTableWrapper data={extensiveServices} />;
}
