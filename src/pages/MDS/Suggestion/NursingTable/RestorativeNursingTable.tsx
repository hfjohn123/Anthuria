import NursingTableWrapper from './NursingTableWrapper.tsx';
import { RestorativeNursing } from '../../../../types/MDSFinal.ts';
import { useState } from 'react';
import _ from 'lodash';

const restorative_nursing = [
  {
    mds_item: 'H0200C, H0500',
    description: 'Urinary toileting program and/or bowel toileting program',
  },
  {
    mds_item: 'O0500A,B',
    description: 'Passive and/or active range of motion',
  },
  {
    mds_item: 'O0500C',
    description: 'Splint or brace assistance',
  },
  {
    mds_item: 'O0500D,F',
    description: 'Bed mobility and/or walking training',
  },
  {
    mds_item: 'O0500E',
    description: 'Transfer training',
  },
  {
    mds_item: 'O0500G',
    description: 'Dressing and/or grooming training',
  },
  {
    mds_item: 'O0500H',
    description: 'Eating and/or swallowing training',
  },
  {
    mds_item: 'O0500I',
    description: 'Amputation/prostheses care',
  },
  {
    mds_item: 'O0500J',
    description: 'Communication training',
  },
];

export default function RestorativeNursingTable({
  data,
}: {
  data: RestorativeNursing;
}) {
  const [joined] = useState(
    _.merge(restorative_nursing, data.restorative_count_all),
  );
  return (
    <div className="flex flex-col gap-3">
      <p className="font-semibold">
        Restorative Nurse Count: {data.final_count || 0}
      </p>

      <NursingTableWrapper data={joined} />
    </div>
  );
}
