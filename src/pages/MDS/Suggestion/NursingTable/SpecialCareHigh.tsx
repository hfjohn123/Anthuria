import NursingTableWrapper from './NursingTableWrapper.tsx';
import { NursingCC } from '../../../../types/MDSFinal.ts';
import { useState } from 'react';
import _ from 'lodash';

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

export default function SpecialCareHigh({ data }: { data?: NursingCC[] }) {
  const [joined] = useState(
    _.merge(_.keyBy(specialCareHigh, 'mds_item'), _.keyBy(data, 'mds_item')),
  );
  <div className="flex flex-col gap-3">
    <p className="font-semibold">Clinical Category: {data ? 'Yes' : 'No'}</p>
    <NursingTableWrapper data={_.values(joined)} />
  </div>;
}
