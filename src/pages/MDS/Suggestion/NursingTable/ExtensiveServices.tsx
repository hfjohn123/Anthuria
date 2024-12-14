import NursingTableWrapper from './NursingTableWrapper.tsx';
import { NursingCC } from '../../../../types/MDSFinal.ts';
import { useState } from 'react';
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

export default function ExtensiveServices({ data }: { data?: NursingCC[] }) {
  const [joined] = useState(
    _.merge(_.keyBy(extensiveServices, 'mds_item'), _.keyBy(data, 'mds_item')),
  );
  return (
    <div className="flex flex-col gap-3">
      <p className="font-semibold">Clinical Category: {data ? 'Yes' : 'No'}</p>
      <NursingTableWrapper data={_.values(joined)} />
    </div>
  );
}
