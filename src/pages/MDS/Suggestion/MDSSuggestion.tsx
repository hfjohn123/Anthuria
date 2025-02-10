import { CaretRight } from '@phosphor-icons/react';
import { MDSFinal, SLPEntry } from '../../../types/MDSFinal.ts';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import NTATable from './NTATable/NTATable.tsx';
import SLPTable from './SLPTable/SLPTable.tsx';
import PTOTTable from './PTOTTable/PTOTTable.tsx';
import NursingTable from './NursingTable/NursingTable.tsx';
import formatCounts from './formatCounts.ts';
import { NusingMapping } from '../cmiMapping.ts';
import MagicButton from '../../../images/icon/MagicButton.tsx';
import { Tooltip } from 'primereact/tooltip';

import clsx from 'clsx';
import _ from 'lodash';
import { useContext } from 'react';
import { MDSPatientContext } from './MDSDetailLoading.tsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../../components/AuthWrapper.tsx';

const SLPSkeleton = [
  { item: 'ci', condition: 'Cognitive Impairment' },
  { item: 'cp', condition: 'Comorbidities Present' },
  { item: 'anc', condition: 'Acute Neurologic Condition' },
  { item: 'mad', condition: 'Mechanically Altered Diet' },
  { item: 'sd', condition: 'Swallowing Disorder' },
];
const PTOTSkeleton = [
  {
    function_area: 'Eating',
    mds_item: 'GG0130A',
  },
  {
    function_area: 'Oral Hygiene',
    mds_item: 'GG0130B',
  },
  {
    function_area: 'Toileting Hygiene',
    mds_item: 'GG0130C',
  },
  {
    function_area: 'Mobility',
    mds_item: 'GG0170B',
  },
  {
    function_area: 'Mobility',
    mds_item: 'GG0170C',
  },
  {
    function_area: 'Transfer',
    mds_item: 'GG0170D',
  },
  {
    function_area: 'Transfer',
    mds_item: 'GG0170E',
  },
  {
    function_area: 'Transfer',
    mds_item: 'GG0170F',
  },
  {
    function_area: 'Walking',
    mds_item: 'GG0170J',
  },
  {
    function_area: 'Walking',
    mds_item: 'GG0170K',
  },
];

export default function MDSSuggestion({ row }: { row: MDSFinal }) {
  const patientInfo = useContext(MDSPatientContext);
  const { route, user_data } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const touchLog = useMutation({
    mutationFn: async (component: string) => {
      return axios.put(`${route}/mds/touch_log`, {
        internal_facility_id: patientInfo.internal_facility_id,
        internal_patient_id: patientInfo.internal_patient_id,
        component,
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['/mds/view_pdpm_mds_patient_list', route],
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['/mds/view_pdpm_mds_patient_list', route],
      });
    },
  });
  const ptot_joined = _.values(
    _.merge(
      {},
      _.keyBy(PTOTSkeleton, 'mds_item'),
      _.keyBy(row.ptot_final_entry.function_score_all, 'mds_item'),
    ),
  );
  const ptot_data = {
    clinical_category: row.ptot_final_entry.clinical_category,
    mix_group: row.ptot_final_entry.mix_group,
    final_score: row.ptot_final_entry.final_score,
    function_score_all: ptot_joined,
  };

  const slp_joined = _.merge(
    {},
    _.keyBy(SLPSkeleton, 'item'),
    _.keyBy(row.slp_final_entry, 'item'),
  );
  const nta_count = row.nta_final_entry
    .flatMap((d) => d.suggestion)
    .flatMap((d) => d?.progress_note)
    .reduce((acc: { [key: string]: number }, item) => {
      if (!item || !item.source_category) return acc;
      acc[item.source_category] = (acc[item.source_category] || 0) + 1;
      return acc;
    }, {});
  const slp_count = row.slp_final_entry
    .flatMap((d) => {
      if (d.item === 'cp') {
        return d.suggestion
          ?.flatMap((d: SLPEntry) => d.suggestion)
          ?.flatMap((d) => d.progress_note);
      }
      return d.suggestion;
    })
    .reduce((acc: { [key: string]: number }, item) => {
      if (!item || !item.source_category) return acc;
      acc[item.source_category] = (acc[item.source_category] || 0) + 1;
      return acc;
    }, {});
  const ptotCount = (
    row.ptot_final_entry.function_score_all?.flatMap((d) => d.suggestion) || []
  ).reduce((acc: { [key: string]: number }, item) => {
    if (!item || !item.source_category) return acc;
    acc[item.source_category] = (acc[item.source_category] || 0) + 1;
    return acc;
  }, {});
  const ptotSuggestionCount = (
    row.ptot_final_entry?.function_score_all || []
  ).filter((d) => d.suggestion && d.suggestion.length > 0).length;
  const currentGroup = row.nursing_group;

  const suggestGroup = patientInfo.suggest_nursing_group;
  const suggestCMI = patientInfo.suggest_nursing_cmi;
  const NTASuggestionCount = row.nta_final_entry.filter(
    (d) =>
      (d.suggestion?.length || 0 > 0) &&
      (d.is_thumb_down === null || !d.is_thumb_down),
  ).length;
  const SLPSuggestionCount = row.slp_final_entry.filter(
    (d) =>
      (d.suggestion?.length || 0 > 0) &&
      (d.is_thumb_down === null || !d.is_thumb_down),
  ).length;
  const NursingSuggestionCount = patientInfo.n_nursing_suggestion;

  let NursingCount = currentGroup
    ? `Current Mix Group: ${currentGroup}, Current CMI: ${NusingMapping[currentGroup as keyof typeof NusingMapping]}, `
    : '';
  NursingCount =
    NursingCount +
    `Suggested Mix Group: ${suggestGroup}, Suggested CMI: ${suggestCMI}`;
  const NTAValue = patientInfo.suggest_nta_pay - patientInfo.mds_nta_pay;
  const SLPValue = patientInfo.suggest_slp_pay - patientInfo.mds_slp_pay;
  const NursingValue =
    patientInfo.suggest_nursing_pay - patientInfo.mds_nursing_pay;
  const PTOTValue =
    patientInfo.suggest_pt_pay +
    patientInfo.suggest_ot_pay -
    patientInfo.mds_pt_pay -
    patientInfo.mds_ot_pay;

  return (
    <div className="flex flex-col gap-3 py-4 px-3 w-full ">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold underline">Suggestions</h3>
      </div>

      <Tooltip
        className="z-99 w-44 text-xs"
        target=".suggestion-counter"
        position="top"
      />

      <div className="flex flex-col">
        <Disclosure>
          {({ open }) => (
            <>
              <DisclosureButton
                className="group "
                onClick={() => {
                  if (
                    patientInfo.pt_touched !== 1 &&
                    !open &&
                    (user_data.organization_id !== 'the_triedge_labs' ||
                      user_data.email === 'qi.song@triedgelab.com' ||
                      user_data.email === 'sam.pan@triedgelab.com') &&
                    (!user_data.email.endsWith('theportopiccologroup.com') ||
                      user_data.email ===
                        'testavetura@theportopiccologroup.com') &&
                    !user_data.email.endsWith('anthuria.ai')
                  ) {
                    touchLog.mutate('ptot');
                  }
                }}
              >
                <div className="flex items-center py-2 gap-2 hover:bg-[#E6F3FF] ">
                  <CaretRight className="ease-in-out transition-all duration-200  group-data-[open]:rotate-90" />
                  <h3 className="text-base font-semibold">PT/OT</h3>
                  <div
                    className={clsx(
                      ' py-1.5 px-3 rounded flex gap-1 items-center suggestion-counter',
                      ptotSuggestionCount > 0
                        ? 'bg-slate-200 text-gray-600  font-semibold'
                        : 'bg-slate-200 text-gray-400',
                    )}
                    data-pr-tooltip={formatCounts(ptotCount)}
                  >
                    {ptotSuggestionCount > 0 && (
                      <MagicButton className="size-4" />
                    )}
                    {ptotSuggestionCount} AI SUGGESTION
                    {ptotSuggestionCount !== 1 && 'S'}
                  </div>
                  <p className="text-gray-600 ">
                    RATE OPP:{' '}
                    {parseInt(PTOTValue.toFixed()) >= 0
                      ? '$' + PTOTValue.toFixed(2).replace('-', '')
                      : '-$' + PTOTValue.toFixed(2).replace('-', '')}
                  </p>
                </div>
              </DisclosureButton>
              <DisclosurePanel
                transition
                className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-3 data-[closed]:opacity-0"
              >
                <PTOTTable data={ptot_data} />
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
        <Disclosure>
          {({ open }) => (
            <>
              <DisclosureButton
                className="group "
                onClick={() => {
                  if (
                    patientInfo.slp_touched !== 1 &&
                    !open &&
                    (user_data.organization_id !== 'the_triedge_labs' ||
                      user_data.email === 'qi.song@triedgelab.com' ||
                      user_data.email === 'sam.pan@triedgelab.com') &&
                    (!user_data.email.endsWith('theportopiccologroup.com') ||
                      user_data.email ===
                        'testavetura@theportopiccologroup.com') &&
                    !user_data.email.endsWith('anthuria.ai')
                  ) {
                    touchLog.mutate('slp');
                  }
                }}
              >
                <div className="flex items-center py-2 gap-2 hover:bg-[#E6F3FF] ">
                  <CaretRight className="ease-in-out transition-all duration-200  group-data-[open]:rotate-90" />
                  <h3 className="text-base font-semibold">SLP</h3>
                  <div
                    className={clsx(
                      ' py-1.5 px-3 rounded flex gap-1 items-center suggestion-counter',
                      SLPSuggestionCount > 0
                        ? 'bg-slate-200 text-gray-600  font-semibold'
                        : 'bg-slate-200 text-gray-400',
                    )}
                    data-pr-tooltip={formatCounts(slp_count)}
                  >
                    {SLPSuggestionCount > 0 && (
                      <MagicButton className="size-4" />
                    )}
                    {SLPSuggestionCount} AI SUGGESTION
                    {SLPSuggestionCount !== 1 && 'S'}
                  </div>
                  <p className="text-gray-600 ">
                    RATE OPP:{' '}
                    {parseInt(SLPValue.toFixed()) >= 0
                      ? '$' + SLPValue.toFixed(2).replace('-', '')
                      : '-$' + SLPValue.toFixed(2).replace('-', '')}
                  </p>
                </div>
              </DisclosureButton>
              <DisclosurePanel
                transition
                className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-3 data-[closed]:opacity-0"
              >
                <SLPTable data={_.values(slp_joined)} />
              </DisclosurePanel>
            </>
          )}
        </Disclosure>

        <Disclosure>
          {({ open }) => (
            <>
              <DisclosureButton
                className="group "
                onClick={() => {
                  if (
                    patientInfo.nursing_touched !== 1 &&
                    !open &&
                    (user_data.organization_id !== 'the_triedge_labs' ||
                      user_data.email === 'qi.song@triedgelab.com' ||
                      user_data.email === 'sam.pan@triedgelab.com') &&
                    (!user_data.email.endsWith('theportopiccologroup.com') ||
                      user_data.email ===
                        'testavetura@theportopiccologroup.com') &&
                    !user_data.email.endsWith('anthuria.ai')
                  ) {
                    touchLog.mutate('nursing');
                  }
                }}
              >
                <div className="flex items-center py-2 gap-2 hover:bg-[#E6F3FF] ">
                  <CaretRight className="ease-in-out transition-all duration-200  group-data-[open]:rotate-90" />
                  <h3 className="text-base font-semibold">Nursing </h3>
                  <div
                    className={clsx(
                      ' py-1.5 px-3 rounded flex gap-1 items-center suggestion-counter',
                      NursingSuggestionCount > 0
                        ? 'bg-slate-200 text-gray-600  font-semibold'
                        : 'bg-slate-200 text-gray-400',
                    )}
                    data-pr-tooltip={NursingCount || ''}
                  >
                    {NursingSuggestionCount > 0 && (
                      <MagicButton className="size-4" />
                    )}
                    {NursingSuggestionCount} AI SUGGESTION
                    {NursingSuggestionCount !== 1 && 'S'}
                  </div>
                  <p className="text-gray-600 ">
                    RATE OPP:{' '}
                    {parseInt(NursingValue.toFixed()) >= 0
                      ? '$' + NursingValue.toFixed(2).replace('-', '')
                      : '-$' + NursingValue.toFixed(2).replace('-', '')}
                  </p>
                </div>
              </DisclosureButton>
              <DisclosurePanel
                transition
                className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-3 data-[closed]:opacity-0"
              >
                <NursingTable data={row} />
              </DisclosurePanel>
            </>
          )}
        </Disclosure>

        <Disclosure>
          {({ open }) => (
            <>
              <DisclosureButton
                className="group"
                onClick={() => {
                  if (
                    patientInfo.nta_touched !== 1 &&
                    !open &&
                    (user_data.organization_id !== 'the_triedge_labs' ||
                      user_data.email === 'qi.song@triedgelab.com' ||
                      user_data.email === 'sam.pan@triedgelab.com') &&
                    (!user_data.email.endsWith('theportopiccologroup.com') ||
                      user_data.email ===
                        'testavetura@theportopiccologroup.com') &&
                    !user_data.email.endsWith('anthuria.ai')
                  ) {
                    touchLog.mutate('nta');
                  }
                }}
              >
                <div className="flex items-center py-2 gap-2 hover:bg-[#E6F3FF] ">
                  <CaretRight className="ease-in-out transition-all duration-200  group-data-[open]:rotate-90" />

                  <h3 className="text-base font-semibold">NTA</h3>

                  <div
                    className={clsx(
                      'py-1.5 px-3 rounded flex gap-1 items-center suggestion-counter',
                      NTASuggestionCount > 0
                        ? 'bg-slate-200 text-gray-600  font-semibold'
                        : 'bg-slate-200 text-gray-400',
                    )}
                    data-pr-tooltip={formatCounts(nta_count)}
                  >
                    {NTASuggestionCount > 0 && (
                      <MagicButton className="size-4" />
                    )}
                    {NTASuggestionCount} AI SUGGESTION
                    {NTASuggestionCount !== 1 && 'S'}
                  </div>
                  <p className="text-gray-600 ">
                    RATE OPP:{' '}
                    {parseInt(NTAValue.toFixed()) >= 0
                      ? '$' + NTAValue.toFixed(2).replace('-', '')
                      : '-$' + NTAValue.toFixed(2).replace('-', '')}
                  </p>
                </div>
              </DisclosureButton>
              <DisclosurePanel
                transition
                className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-3 data-[closed]:opacity-0"
              >
                <NTATable data={row.nta_final_entry} />
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </div>
    </div>
  );
}
