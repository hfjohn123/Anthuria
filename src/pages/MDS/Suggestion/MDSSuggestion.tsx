import { Bot } from 'lucide-react';
import { CaretRight } from '@phosphor-icons/react';
import {
  MDSFinal,
  SLPEntry,
  SLPItem_comorbidities_present,
  SLPItem_General,
} from '../../../types/MDSFinal.ts';
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

const SLPSkeleton = [
  { item: 'ci', condition: 'Cognitive Impairment' },
  { item: 'cp', condition: 'Comorbidities Present' },
  { item: 'anc', condition: 'Acute Neurologic Condition' },
  { item: 'mad', condition: 'Mechanically Altered Diet' },
  { item: 'sd', condition: 'Swallowing Disorder' },
];

export default function MDSSuggestion({ row }: { row: MDSFinal }) {
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
        return (d as SLPItem_comorbidities_present).suggestion
          ?.flatMap((d: SLPEntry) => d.suggestion)
          ?.flatMap((d) => d.progress_note);
      }
      return (d as SLPItem_General).suggestion;
    })
    .reduce((acc: { [key: string]: number }, item) => {
      if (!item || !item.source_category) return acc;
      acc[item.source_category] = (acc[item.source_category] || 0) + 1;
      return acc;
    }, {});
  const extensiveServices = row.nursing_cc_final_entry.nursing_mds_item_es;
  const specialCareHigh = row.nursing_cc_final_entry.nursing_mds_item_sch;
  const specialCareLow = row.nursing_cc_final_entry.nursing_mds_item_scl;
  const clinicalComplex = row.nursing_cc_final_entry.nursing_mds_item_cc;

  const functionalScore = row.nursing_fa_final_entry;
  const depressionIndicator = row.nursing_d_final_entry;
  const BIMS = row.nursing_bscp_final_entry.nursing_bscp_bims;
  const currentGroup = row.nursing_group;

  const boolFuncScore14 = !!(
    functionalScore.final_score && parseInt(functionalScore.final_score) <= 14
  );
  const boolFuncScore11 = !!(
    functionalScore.final_score && parseInt(functionalScore.final_score) <= 11
  );
  let boolsch = false;
  if (specialCareHigh) {
    if (specialCareHigh.length > 1) {
      boolsch = true;
    }
    if (specialCareHigh.length === 1) {
      if (
        (specialCareHigh[0].mds_item === 'I5100, Nursing Function Score' &&
          boolFuncScore11) ||
        specialCareHigh[0].mds_item !== 'I5100, Nursing Function Score'
      ) {
        boolsch = true;
      }
    }
  }
  let boolscl = false;
  if (specialCareLow) {
    if (
      specialCareLow.filter(
        (item) =>
          item.mds_item === 'I4400, Nursing Function Score' ||
          item.mds_item === 'I5200, Nursing Function Score' ||
          item.mds_item === 'I5300, Nursing Function Score',
      ).length === specialCareLow.length
    ) {
      if (boolFuncScore11) {
        boolscl = true;
      }
    } else {
      boolscl = true;
    }
  }
  let boolcc = false;
  if (clinicalComplex) {
    if (
      clinicalComplex[0].mds_item === 'I4900, Nursing Function Score' &&
      boolFuncScore11
    ) {
      boolcc = true;
    }
    if (clinicalComplex[0].mds_item !== 'I4900, Nursing Function Score') {
      boolcc = true;
    }
    if (clinicalComplex.length > 1) {
      boolcc = true;
    }
  }
  const boolIsDepressed = !!(
    depressionIndicator.is_mds || depressionIndicator.is_suggest
  );
  let suggestGroup = 'PA1';
  if (
    extensiveServices?.some((item) => item.mds_item === 'O0110E1B') &&
    boolFuncScore14
  ) {
    suggestGroup = 'ES3';
  } else if (
    extensiveServices?.some((item) => item.mds_item === 'O0110F1B') &&
    boolFuncScore14
  ) {
    suggestGroup = 'ES2';
  } else if (
    extensiveServices?.some((item) => item.mds_item === 'O0110M1B') &&
    boolFuncScore14
  ) {
    suggestGroup = 'ES1';
  } else if (boolsch && boolFuncScore14) {
    if (parseInt(functionalScore.final_score) <= 5 && boolIsDepressed) {
      suggestGroup = 'HDE2';
    } else if (parseInt(functionalScore.final_score) <= 5) {
      suggestGroup = 'HBC2';
    } else if (boolIsDepressed) {
      suggestGroup = 'HDE1';
    } else {
      suggestGroup = 'HBC1';
    }
  } else if (boolscl && boolFuncScore14) {
    if (parseInt(functionalScore.final_score) <= 5 && boolIsDepressed) {
      suggestGroup = 'LDE2';
    } else if (parseInt(functionalScore.final_score) <= 5) {
      suggestGroup = 'LBC2';
    } else if (boolIsDepressed) {
      suggestGroup = 'LDE1';
    } else {
      suggestGroup = 'LBC1';
    }
  } else if (boolcc) {
    if (parseInt(functionalScore.final_score || '99') <= 5 && boolIsDepressed) {
      suggestGroup = 'CDE2';
    } else if (boolFuncScore14 && boolIsDepressed) {
      suggestGroup = 'CBC2';
    } else if (boolIsDepressed) {
      suggestGroup = 'CA2';
    } else if (parseInt(functionalScore.final_score || '99') <= 5) {
      suggestGroup = 'CDE1';
    } else if (boolFuncScore14) {
      suggestGroup = 'CBC1';
    } else {
      suggestGroup = 'CA1';
    }
  } else if (
    (parseInt(BIMS?.mds_value || '99') <= 9 ||
      parseInt(BIMS?.suggested_value || '99') <= 9 ||
      ((BIMS?.mds_value != '99' || BIMS?.suggested_value != '99') &&
        row.nursing_bscp_final_entry.nursing_bscp_mds_bs) ||
      row.nursing_bscp_final_entry.nursing_bscp_mds_sacs) &&
    !boolFuncScore11
  ) {
    if (row.nursing_re_final_entry?.final_count || 0 >= 2) {
      suggestGroup = 'BAB2';
    } else {
      suggestGroup = 'BAB1';
    }
  } else {
    if (
      (parseInt(functionalScore.final_score || '99') <= 5 &&
        row.nursing_re_final_entry?.final_count) ||
      0 >= 2
    ) {
      suggestGroup = 'PDE2';
    } else if (
      (boolFuncScore14 && row.nursing_re_final_entry?.final_count) ||
      0 >= 2
    ) {
      suggestGroup = 'PBC2';
    } else if (row.nursing_re_final_entry?.final_count || 0 >= 2) {
      suggestGroup = 'PA2';
    } else if (parseInt(functionalScore.final_score || '99') <= 5) {
      suggestGroup = 'PDE1';
    } else if (boolFuncScore14) {
      suggestGroup = 'PBC1';
    } else {
      suggestGroup = 'PA1';
    }
  }
  const suggestCMI = NusingMapping[suggestGroup as keyof typeof NusingMapping];
  const NTASuggestionCount = row.nta_final_entry.filter(
    (d) => d.suggestion?.length || 0 > 0,
  ).length;
  const SLPSuggestionCount = row.slp_final_entry.filter(
    (d) => d.suggestion?.length || 0 > 0,
  ).length;
  const NursingSuggestionCount =
    (extensiveServices?.filter((d) => d.nursing_mds_suggestion.length > 0)
      .length || 0) +
    (specialCareHigh?.filter((d) => d.nursing_mds_suggestion.length > 0)
      .length || 0) +
    (specialCareLow?.filter((d) => d.nursing_mds_suggestion.length > 0)
      .length || 0) +
    (clinicalComplex?.filter((d) => d.nursing_mds_suggestion.length > 0)
      .length || 0) +
    (BIMS?.suggested_value ? 1 : 0);
  let NursingCount = currentGroup
    ? `Current Mix Group: ${currentGroup}, Current CMI: ${NusingMapping[currentGroup as keyof typeof NusingMapping]}, `
    : '';
  NursingCount =
    NursingCount +
    `Suggested Mix Group: ${suggestGroup}, Suggested CMI: ${suggestCMI}`;

  return (
    <div className="flex flex-col gap-3 py-4 px-3 w-full ">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold underline">Suggestions</h3>
        <Bot
          data-pr-tooltip="Suggestions generated by AI from Progress Note"
          className="size-6 focus:outline-none bot-icon"
        />
      </div>
      <Tooltip className="z-99 text-xs" target=".bot-icon" />
      <Tooltip
        className="z-99 w-44 text-xs"
        target=".suggestion-counter"
        position="top"
      />

      <div className="flex flex-col">
        <Disclosure defaultOpen={NTASuggestionCount > 0}>
          <DisclosureButton className="group">
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
                {NTASuggestionCount > 0 && <MagicButton className="size-4" />}
                {NTASuggestionCount} AI SUGGESTIONS
              </div>
            </div>
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-3 data-[closed]:opacity-0"
          >
            <NTATable data={row.nta_final_entry} />
          </DisclosurePanel>
        </Disclosure>
        <Disclosure defaultOpen={SLPSuggestionCount > 0}>
          <DisclosureButton className="group ">
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
                {SLPSuggestionCount > 0 && <MagicButton className="size-4" />}
                {SLPSuggestionCount} AI SUGGESTIONS
              </div>
            </div>
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-3 data-[closed]:opacity-0"
          >
            <SLPTable data={_.values(slp_joined)} />
          </DisclosurePanel>
        </Disclosure>

        <Disclosure>
          <DisclosureButton className="group ">
            <div className="flex items-center py-2 gap-2 hover:bg-[#E6F3FF] ">
              <CaretRight className="ease-in-out transition-all duration-200  group-data-[open]:rotate-90" />
              <h3 className="text-base font-semibold">PT/OT</h3>
              <div
                className={clsx(
                  'py-1.5 px-3 rounded flex gap-1 items-center suggestion-counter bg-slate-200 text-gray-400',
                )}
              >
                0 AI SUGGESTIONS
              </div>
            </div>
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-3 data-[closed]:opacity-0"
          >
            {row.ptot_final_entry.clinical_category ? (
              <PTOTTable data={row.ptot_final_entry} />
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="font-bold text-lg">No Record Found</p>
              </div>
            )}
          </DisclosurePanel>
        </Disclosure>

        <Disclosure>
          <DisclosureButton className="group ">
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
                {NursingSuggestionCount} AI SUGGESTIONS
              </div>
            </div>
          </DisclosureButton>
          <DisclosurePanel
            transition
            className="origin-top transition duration-200 ease-out data-[closed]:-translate-y-3 data-[closed]:opacity-0"
          >
            <NursingTable data={row} />
          </DisclosurePanel>
        </Disclosure>
      </div>
    </div>
  );
}
