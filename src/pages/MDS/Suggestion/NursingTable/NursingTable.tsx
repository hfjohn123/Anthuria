import { Stepper, StepperRefAttributes } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { createContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import ClinicalCategory from './ClinicalCategory.tsx';
import FunctionalScoreTable from './FunctionalScoreTable.tsx';
import RestorativeNursingTable from './RestorativeNursingTable.tsx';
import { MDSFinal } from '../../../../types/MDSFinal.ts';
import DepressionIndicator from './DepressionIndicator.tsx';
import clsx from 'clsx';
import EvidenceModal from '../EvidenceModal.tsx';
import { NusingMapping } from '../../cmiMapping.ts';
import _ from 'lodash';

export const NursingTableContext = createContext<MDSFinal | null>(null);

const FunctionalScoreSkeleton = [
  { function_area: 'Eating', mds_item: 'GG0130A' },
  { function_area: 'Toileting Hygiene', mds_item: 'GG0130C' },
  { function_area: 'Mobility', mds_item: 'GG0170B' },
  { function_area: 'Mobility', mds_item: 'GG0170C' },
  { function_area: 'Transfer', mds_item: 'GG0170D' },
  { function_area: 'Transfer', mds_item: 'GG0170E' },
  { function_area: 'Transfer', mds_item: 'GG0170F' },
];

export default function NursingTable({ data }: { data: MDSFinal }) {
  const stepperRef = useRef<StepperRefAttributes>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(
    'horizontal',
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      // Using clientWidth instead of contentRect
      const width = containerRef.current?.clientWidth || 0;
      setOrientation(width < 1470 ? 'vertical' : 'horizontal');
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);
  const extensiveServices = data.nursing_cc_final_entry.nursing_mds_item_es;
  const specialCareHigh = data.nursing_cc_final_entry.nursing_mds_item_sch;
  const specialCareLow = data.nursing_cc_final_entry.nursing_mds_item_scl;
  const clinicalComplex = data.nursing_cc_final_entry.nursing_mds_item_cc;
  const functionalScore = data.nursing_fa_final_entry;
  const functionalScoreJoined = _.values(
    _.merge(
      {},
      _.keyBy(FunctionalScoreSkeleton, 'mds_item'),
      _.keyBy(functionalScore.function_score_all, 'mds_item'),
    ),
  );
  const functionalScoreFinal = {
    final_score: functionalScore.final_score,
    function_score_all: functionalScoreJoined,
  };
  const depressionIndicator = data.nursing_d_final_entry;
  const BIMS = data.nursing_bscp_final_entry.nursing_bscp_bims;
  const currentGroup = data.nursing_group;

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
    if (parseInt(functionalScore.final_score || '99') <= 5 && boolIsDepressed) {
      suggestGroup = 'HDE2';
    } else if (parseInt(functionalScore.final_score || '99') <= 5) {
      suggestGroup = 'HBC2';
    } else if (boolIsDepressed) {
      suggestGroup = 'HDE1';
    } else {
      suggestGroup = 'HBC1';
    }
  } else if (boolscl && boolFuncScore14) {
    if (parseInt(functionalScore.final_score || '99') <= 5 && boolIsDepressed) {
      suggestGroup = 'LDE2';
    } else if (parseInt(functionalScore.final_score || '99') <= 5) {
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
      (BIMS?.mds_value != '99' &&
        data.nursing_bscp_final_entry.nursing_bscp_mds_bs) ||
      data.nursing_bscp_final_entry.nursing_bscp_mds_sacs) &&
    !boolFuncScore11
  ) {
    if (data.nursing_re_final_entry?.final_count || 0 >= 2) {
      suggestGroup = 'BAB2';
    } else {
      suggestGroup = 'BAB1';
    }
  } else {
    if (
      (parseInt(functionalScore.final_score || '99') <= 5 &&
        data.nursing_re_final_entry?.final_count) ||
      0 >= 2
    ) {
      suggestGroup = 'PDE2';
    } else if (
      (boolFuncScore14 && data.nursing_re_final_entry?.final_count) ||
      0 >= 2
    ) {
      suggestGroup = 'PBC2';
    } else if (data.nursing_re_final_entry?.final_count || 0 >= 2) {
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

  return (
    <NursingTableContext.Provider value={data}>
      <div
        ref={containerRef}
        className="flex flex-col gap-5 px-5 py-5 scroll-mt-26"
      >
        <Stepper
          ref={stepperRef}
          pt={{ panelContainer: () => 'bg-transparent' }}
          headerPosition="bottom"
          orientation={orientation}
          onChangeStep={() => {
            containerRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }}
        >
          <StepperPanel
            pt={{
              number: (props) =>
                clsx(
                  'p-stepper-number',
                  // eslint-disable-next-line react/prop-types
                  !props.context.active &&
                    (currentGroup?.startsWith('E') ||
                      suggestGroup.startsWith('E'))
                    ? 'bg-yellow-500'
                    : '',
                  '',
                ),
              header: (props) =>
                clsx(
                  'p-stepper-header items-center',
                  // eslint-disable-next-line react/prop-types
                  props.context.active && 'p-highlight',
                  orientation === 'horizontal' && 'p-stepper-header-bottom',
                ),
              action: () =>
                clsx(
                  'p-stepper-action p-component bg-transparent gap-1',
                  suggestGroup.startsWith('E') &&
                    orientation === 'horizontal' &&
                    'before:content-["Recommended"]',
                  suggestGroup.startsWith('E') &&
                    orientation === 'vertical' &&
                    "after:content-['Recommended'] ",
                  currentGroup?.startsWith('E') &&
                    orientation === 'horizontal' &&
                    !suggestGroup.startsWith('E') &&
                    'before:content-["Current_Group"]',
                  currentGroup?.startsWith('E') &&
                    orientation === 'vertical' &&
                    !suggestGroup.startsWith('E') &&
                    "after:content-['Current_Group'] ",
                ),
              toggleableContent: () =>
                'p-stepper-toggleable-content bg-transparent',
            }}
            header="Extensive Services"
          >
            <div className="flex flex-col gap-7 ">
              <ClinicalCategory
                type="extensiveServices"
                data={extensiveServices}
              />
              <FunctionalScoreTable data={functionalScoreFinal} />
              {currentGroup?.startsWith('E') && (
                <div>
                  <p className="font-bold">Current group: </p>
                  <p>
                    {currentGroup} (CMI:{' '}
                    {NusingMapping[currentGroup as keyof typeof NusingMapping]})
                  </p>
                </div>
              )}
              {suggestGroup?.startsWith('E') && (
                <div>
                  <p className="font-bold">Suggested group: </p>
                  <p>
                    {suggestGroup} (CMI: {suggestCMI})
                  </p>
                </div>
              )}
            </div>
            <div className="flex pt-4 justify-end">
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={() => stepperRef.current?.nextCallback()}
              />
            </div>
          </StepperPanel>
          <StepperPanel
            pt={{
              number: (props) =>
                clsx(
                  'p-stepper-number',
                  // eslint-disable-next-line react/prop-types
                  !props.context.active &&
                    (currentGroup?.startsWith('H') ||
                      suggestGroup.startsWith('H'))
                    ? 'bg-yellow-500'
                    : '',
                  '',
                ),
              header: (props) =>
                clsx(
                  'p-stepper-header items-center',
                  // eslint-disable-next-line react/prop-types
                  props.context.active && 'p-highlight',
                  orientation === 'horizontal' && 'p-stepper-header-bottom',
                ),
              action: () =>
                clsx(
                  'p-stepper-action p-component bg-transparent gap-1',
                  suggestGroup.startsWith('H') &&
                    orientation === 'horizontal' &&
                    'before:content-["Recommended"]',
                  suggestGroup.startsWith('H') &&
                    orientation === 'vertical' &&
                    "after:content-['Recommended'] ",
                  currentGroup?.startsWith('H') &&
                    orientation === 'horizontal' &&
                    !suggestGroup.startsWith('H') &&
                    'before:content-["Current_Group"]',
                  currentGroup?.startsWith('H') &&
                    orientation === 'vertical' &&
                    !suggestGroup.startsWith('H') &&
                    "after:content-['Current_Group'] ",
                ),
              toggleableContent: () =>
                'p-stepper-toggleable-content bg-transparent',
            }}
            header="Special Care High"
          >
            <div className="flex flex-col gap-7 ">
              <ClinicalCategory type="specialCareHigh" data={specialCareHigh} />
              <FunctionalScoreTable data={functionalScoreFinal} />
              <DepressionIndicator data={depressionIndicator} />
              {currentGroup?.startsWith('H') && (
                <div>
                  <p className="font-bold">Current group: </p>
                  <p>
                    {currentGroup} (CMI:{' '}
                    {NusingMapping[currentGroup as keyof typeof NusingMapping]})
                  </p>
                </div>
              )}
              {suggestGroup?.startsWith('H') && (
                <div>
                  <p className="font-bold">Suggested group: </p>
                  <p>
                    {suggestGroup} (CMI: {suggestCMI})
                  </p>
                </div>
              )}
            </div>
            <div className="flex pt-4 justify-between">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                onClick={() => stepperRef.current?.prevCallback()}
              />
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={() => stepperRef.current?.nextCallback()}
              />
            </div>
          </StepperPanel>
          <StepperPanel
            pt={{
              number: (props) =>
                clsx(
                  'p-stepper-number',
                  // eslint-disable-next-line react/prop-types
                  !props.context.active &&
                    (currentGroup?.startsWith('L') ||
                      suggestGroup.startsWith('L'))
                    ? 'bg-yellow-500'
                    : '',
                  '',
                ),
              header: (props) =>
                clsx(
                  'p-stepper-header items-center',
                  // eslint-disable-next-line react/prop-types
                  props.context.active && 'p-highlight',
                  orientation === 'horizontal' && 'p-stepper-header-bottom',
                ),
              action: () =>
                clsx(
                  'p-stepper-action p-component bg-transparent gap-1',
                  suggestGroup.startsWith('L') &&
                    orientation === 'horizontal' &&
                    'before:content-["Recommended"]',
                  suggestGroup.startsWith('L') &&
                    orientation === 'vertical' &&
                    "after:content-['Recommended'] ",
                  currentGroup?.startsWith('L') &&
                    orientation === 'horizontal' &&
                    !suggestGroup.startsWith('L') &&
                    'before:content-["Current_Group"]',
                  currentGroup?.startsWith('L') &&
                    orientation === 'vertical' &&
                    !suggestGroup.startsWith('L') &&
                    "after:content-['Current_Group'] ",
                ),
              toggleableContent: () =>
                'p-stepper-toggleable-content bg-transparent',
            }}
            header="Special Care Low"
          >
            <div className="flex flex-col gap-7">
              <ClinicalCategory type="specialCareLow" data={specialCareLow} />
              <FunctionalScoreTable data={functionalScoreFinal} />
              <DepressionIndicator data={depressionIndicator} />
              {currentGroup?.startsWith('L') && (
                <div>
                  <p className="font-bold">Current group: </p>
                  <p>
                    {currentGroup} (CMI:{' '}
                    {NusingMapping[currentGroup as keyof typeof NusingMapping]})
                  </p>
                </div>
              )}
              {suggestGroup?.startsWith('L') && (
                <div>
                  <p className="font-bold">Suggested group: </p>
                  <p>
                    {suggestGroup} (CMI: {suggestCMI})
                  </p>
                </div>
              )}
            </div>
            <div className="flex pt-4 justify-between">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                onClick={() => stepperRef.current?.prevCallback()}
              />
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={() => stepperRef.current?.nextCallback()}
              />
            </div>
          </StepperPanel>
          <StepperPanel
            pt={{
              number: (props) =>
                clsx(
                  'p-stepper-number',
                  // eslint-disable-next-line react/prop-types
                  !props.context.active &&
                    (currentGroup?.startsWith('C') ||
                      suggestGroup.startsWith('C'))
                    ? 'bg-yellow-500'
                    : '',
                  '',
                ),
              header: (props) =>
                clsx(
                  'p-stepper-header items-center',
                  // eslint-disable-next-line react/prop-types
                  props.context.active && 'p-highlight',
                  orientation === 'horizontal' && 'p-stepper-header-bottom',
                ),
              action: () =>
                clsx(
                  'p-stepper-action p-component bg-transparent gap-1',
                  suggestGroup.startsWith('C') &&
                    orientation === 'horizontal' &&
                    'before:content-["Recommended"]',
                  suggestGroup.startsWith('C') &&
                    orientation === 'vertical' &&
                    "after:content-['Recommended'] ",
                  currentGroup?.startsWith('C') &&
                    orientation === 'horizontal' &&
                    !suggestGroup.startsWith('C') &&
                    'before:content-["Current_Group"]',
                  currentGroup?.startsWith('C') &&
                    orientation === 'vertical' &&
                    !suggestGroup.startsWith('C') &&
                    "after:content-['Current_Group'] ",
                ),
              toggleableContent: () =>
                'p-stepper-toggleable-content bg-transparent',
            }}
            header="Clinically Complex"
          >
            <div className="flex flex-col gap-7">
              <ClinicalCategory
                type="clinicallyComplex"
                data={clinicalComplex}
              />
              <DepressionIndicator data={depressionIndicator} />
              {currentGroup?.startsWith('C') && (
                <div>
                  <p className="font-bold">Current group: </p>
                  <p>
                    {currentGroup} (CMI:{' '}
                    {NusingMapping[currentGroup as keyof typeof NusingMapping]})
                  </p>
                </div>
              )}
              {suggestGroup?.startsWith('C') && (
                <div>
                  <p className="font-bold">Suggested group: </p>
                  <p>
                    {suggestGroup} (CMI: {suggestCMI})
                  </p>
                </div>
              )}
            </div>
            <div className="flex pt-4 justify-between">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                onClick={() => stepperRef.current?.prevCallback()}
              />
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={() => stepperRef.current?.nextCallback()}
              />
            </div>
          </StepperPanel>
          <StepperPanel
            pt={{
              number: (props) =>
                clsx(
                  'p-stepper-number',
                  // eslint-disable-next-line react/prop-types
                  !props.context.active &&
                    (currentGroup?.startsWith('B') ||
                      suggestGroup.startsWith('B'))
                    ? 'bg-yellow-500'
                    : '',
                  '',
                ),
              header: (props) =>
                clsx(
                  'p-stepper-header items-center',
                  // eslint-disable-next-line react/prop-types
                  props.context.active && 'p-highlight',
                  orientation === 'horizontal' && 'p-stepper-header-bottom',
                ),
              action: () =>
                clsx(
                  'p-stepper-action p-component bg-transparent gap-1',
                  suggestGroup.startsWith('B') &&
                    orientation === 'horizontal' &&
                    'before:content-["Recommended"]',
                  suggestGroup.startsWith('B') &&
                    orientation === 'vertical' &&
                    "after:content-['Recommended'] ",
                  currentGroup?.startsWith('B') &&
                    orientation === 'horizontal' &&
                    !suggestGroup.startsWith('B') &&
                    'before:content-["Current_Group"]',
                  currentGroup?.startsWith('B') &&
                    orientation === 'vertical' &&
                    !suggestGroup.startsWith('B') &&
                    "after:content-['Current_Group'] ",
                ),
              toggleableContent: () =>
                'p-stepper-toggleable-content bg-transparent',
            }}
            header="Behavioral Symptoms And Cognitive Performance"
          >
            <div className="flex flex-col gap-7">
              <FunctionalScoreTable data={functionalScoreFinal} />
              <div>
                <p className="font-bold">
                  Resident interview cognitive status:
                </p>

                <p>
                  BIMS: {BIMS?.mds_value || 'No Record Found (99)'}{' '}
                  {BIMS?.nursing_bscp_suggestion &&
                    BIMS?.nursing_bscp_suggestion.length > 0 && (
                      <EvidenceModal
                        button={<span>(AI suggests BIMS)</span>}
                        icd10={{
                          icd10: 'BIMS',
                          progress_note: BIMS.nursing_bscp_suggestion,
                        }}
                      />
                    )}
                </p>
              </div>
              <ClinicalCategory
                type={'Staff assessment cognitive status'}
                data={data.nursing_bscp_final_entry.nursing_bscp_mds_sacs}
              />
              <ClinicalCategory
                type={'Behavioral symptoms'}
                data={data.nursing_bscp_final_entry.nursing_bscp_mds_bs}
              />
              <RestorativeNursingTable data={data.nursing_re_final_entry} />
              {currentGroup?.startsWith('B') && (
                <div>
                  <p className="font-bold">Current group: </p>
                  <p>
                    {currentGroup} (CMI:{' '}
                    {NusingMapping[currentGroup as keyof typeof NusingMapping]})
                  </p>
                </div>
              )}
              {suggestGroup?.startsWith('B') && (
                <div>
                  <p className="font-bold">Suggested group: </p>
                  <p>
                    {suggestGroup} (CMI: {suggestCMI})
                  </p>
                </div>
              )}
            </div>

            <div className="flex pt-4 justify-between">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                onClick={() => stepperRef.current?.prevCallback()}
              />
              <Button
                label="Next"
                icon="pi pi-arrow-right"
                iconPos="right"
                onClick={() => stepperRef.current?.nextCallback()}
              />
            </div>
          </StepperPanel>
          <StepperPanel
            pt={{
              number: (props) =>
                clsx(
                  'p-stepper-number',
                  // eslint-disable-next-line react/prop-types
                  !props.context.active &&
                    (currentGroup?.startsWith('P') ||
                      suggestGroup.startsWith('P'))
                    ? 'bg-yellow-500'
                    : '',
                  '',
                ),
              header: (props) =>
                clsx(
                  'p-stepper-header items-center',
                  // eslint-disable-next-line react/prop-types
                  props.context.active && 'p-highlight',
                  orientation === 'horizontal' && 'p-stepper-header-bottom',
                ),
              action: () =>
                clsx(
                  'p-stepper-action p-component bg-transparent gap-1',
                  suggestGroup.startsWith('P') &&
                    orientation === 'horizontal' &&
                    'before:content-["Recommended"]',
                  suggestGroup.startsWith('P') &&
                    orientation === 'vertical' &&
                    "after:content-['Recommended'] ",
                  currentGroup?.startsWith('P') &&
                    orientation === 'horizontal' &&
                    !suggestGroup.startsWith('P') &&
                    'before:content-["Current_Group"]',
                  currentGroup?.startsWith('P') &&
                    orientation === 'vertical' &&
                    !suggestGroup.startsWith('P') &&
                    "after:content-['Current_Group'] ",
                ),
              toggleableContent: () =>
                'p-stepper-toggleable-content bg-transparent',
            }}
            header="Reduced Physical Function"
          >
            <div className="flex flex-col gap-7">
              <FunctionalScoreTable data={functionalScoreFinal} />
              <RestorativeNursingTable data={data.nursing_re_final_entry} />
              {currentGroup?.startsWith('P') && (
                <div>
                  <p className="font-bold">Current group: </p>
                  <p>
                    {currentGroup} (CMI:{' '}
                    {NusingMapping[currentGroup as keyof typeof NusingMapping]})
                  </p>
                </div>
              )}
              {suggestGroup?.startsWith('P') && (
                <div>
                  <p className="font-bold">Suggested group: </p>
                  <p>
                    {suggestGroup} (CMI: {suggestCMI})
                  </p>
                </div>
              )}
            </div>
            <div className="flex pt-4 ">
              <Button
                label="Back"
                severity="secondary"
                icon="pi pi-arrow-left"
                onClick={() => stepperRef.current?.prevCallback()}
              />
            </div>
          </StepperPanel>
        </Stepper>
      </div>
    </NursingTableContext.Provider>
  );
}
