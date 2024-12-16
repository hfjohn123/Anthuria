import { Stepper, StepperRefAttributes } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import ClinicalCategory from './ClinicalCategory.tsx';
import FunctionalScoreTable from './FunctionalScoreTable.tsx';
import RestorativeNursingTable from './RestorativeNursingTable.tsx';
import { Row } from '@tanstack/react-table';
import { MDSFinal } from '../../../../types/MDSFinal.ts';
import DepressionIndicator from './DepressionIndicator.tsx';
import clsx from 'clsx';

export default function NursingTable({ data }: { data: Row<MDSFinal> }) {
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
  const extensiveServices =
    data.original.nursing_cc_final_entry.nursing_mds_item_es;
  const specialCareHigh =
    data.original.nursing_cc_final_entry.nursing_mds_item_sch;
  const specialCareLow =
    data.original.nursing_cc_final_entry.nursing_mds_item_scl;
  const clinicalComplex =
    data.original.nursing_cc_final_entry.nursing_mds_item_cc;

  const functionalScore = data.original.nursing_fa_final_entry;
  const depressionIndicator = data.original.nursing_d_final_entry;
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
  const es_recommended = !!(
    boolFuncScore14 &&
    (depressionIndicator.is_suggest || depressionIndicator.is_mds) &&
    extensiveServices
  );
  const sch_recommended = !!(
    !es_recommended &&
    boolFuncScore14 &&
    (depressionIndicator.is_suggest || depressionIndicator.is_mds) &&
    boolsch
  );
  const scl_recommended = !!(
    !es_recommended &&
    !sch_recommended &&
    boolFuncScore14 &&
    (depressionIndicator.is_suggest || depressionIndicator.is_mds) &&
    boolscl
  );
  const cc_recommended = !!(
    !es_recommended &&
    !sch_recommended &&
    !scl_recommended &&
    (depressionIndicator.is_suggest || depressionIndicator.is_mds) &&
    boolcc
  );
  const bsac_recommended = !!(
    (
      !es_recommended &&
      !sch_recommended &&
      !scl_recommended &&
      !cc_recommended &&
      !boolFuncScore11
    )
    //todo: BMIS Score and Cog
  );
  const rpf_recommended = !!(
    (
      !es_recommended &&
      !sch_recommended &&
      !scl_recommended &&
      !cc_recommended &&
      !bsac_recommended
    )
    //todo: BMIS Score and Cog
  );
  //todo: BMIS Score and Cog

  return (
    <div ref={containerRef} className="flex flex-col gap-5 px-5 py-5">
      <Stepper
        ref={stepperRef}
        pt={{ panelContainer: () => 'bg-transparent' }}
        headerPosition="bottom"
        orientation={orientation}
      >
        <StepperPanel
          pt={{
            number: (props) =>
              clsx(
                'p-stepper-number',
                // eslint-disable-next-line react/prop-types
                props.context.active || !es_recommended ? '' : 'bg-yellow-500',
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
                es_recommended &&
                  orientation === 'horizontal' &&
                  'before:content-["Recommended"]',
                es_recommended &&
                  orientation === 'vertical' &&
                  "after:content-['Recommended'] ",
              ),
            toggleableContent: () =>
              'p-stepper-toggleable-content bg-transparent',
          }}
          header="Extensive Services"
        >
          <div className="flex flex-col gap-7">
            <ClinicalCategory
              type="extensiveServices"
              data={data.original.nursing_cc_final_entry.nursing_mds_item_es}
            />
            <FunctionalScoreTable data={data.original.nursing_fa_final_entry} />
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
                props.context.active || !sch_recommended ? '' : 'bg-yellow-500',
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
                sch_recommended &&
                  orientation === 'horizontal' &&
                  'before:content-["Recommended"]',
                sch_recommended &&
                  orientation === 'vertical' &&
                  "after:content-['Recommended'] ",
              ),
            toggleableContent: () =>
              'p-stepper-toggleable-content bg-transparent',
          }}
          header="Special Care High"
        >
          <div className="flex flex-col gap-7">
            <ClinicalCategory
              type="specialCareHigh"
              data={data.original.nursing_cc_final_entry.nursing_mds_item_sch}
            />
            <FunctionalScoreTable data={data.original.nursing_fa_final_entry} />
            <DepressionIndicator data={data.original.nursing_d_final_entry} />
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
                props.context.active || !scl_recommended ? '' : 'bg-yellow-500',
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
                scl_recommended &&
                  orientation === 'horizontal' &&
                  'before:content-["Recommended"]',
                scl_recommended &&
                  orientation === 'vertical' &&
                  "after:content-['Recommended'] ",
              ),
            toggleableContent: () =>
              'p-stepper-toggleable-content bg-transparent',
          }}
          header="Special Care Low"
        >
          <div className="flex flex-col gap-7">
            <ClinicalCategory
              type="specialCareLow"
              data={data.original.nursing_cc_final_entry.nursing_mds_item_scl}
            />
            <FunctionalScoreTable data={data.original.nursing_fa_final_entry} />
            <DepressionIndicator data={data.original.nursing_d_final_entry} />
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
                props.context.active || !cc_recommended ? '' : 'bg-yellow-500',
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
                cc_recommended &&
                  orientation === 'horizontal' &&
                  'before:content-["Recommended"]',
                cc_recommended &&
                  orientation === 'vertical' &&
                  "after:content-['Recommended'] ",
              ),
            toggleableContent: () =>
              'p-stepper-toggleable-content bg-transparent',
          }}
          header="Clinically Complex"
        >
          <div className="flex flex-col gap-7">
            <ClinicalCategory
              type="clinicallyComplex"
              data={data.original.nursing_cc_final_entry.nursing_mds_item_cc}
            />
            <DepressionIndicator data={data.original.nursing_d_final_entry} />
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
                props.context.active || !bsac_recommended
                  ? ''
                  : 'bg-yellow-500',
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
                bsac_recommended &&
                  orientation === 'horizontal' &&
                  'before:content-["Recommended"]',
                bsac_recommended &&
                  orientation === 'vertical' &&
                  "after:content-['Recommended'] ",
              ),
            toggleableContent: () =>
              'p-stepper-toggleable-content bg-transparent',
          }}
          header="Behavioral Symptoms And Cognitive Performance"
        >
          <div className="flex flex-col gap-7">
            <FunctionalScoreTable data={data.original.nursing_fa_final_entry} />

            <div>
              <p className="font-bold">Resident interview cognitive status:</p>
              <p>Yes/No</p>
            </div>
            <div>
              <ClinicalCategory type={'Staff assessment cognitive status'} />
            </div>
            <ClinicalCategory type={'Behavioral symptoms'} />
            <RestorativeNursingTable
              data={data.original.nursing_re_final_entry}
            />
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
                props.context.active || !rpf_recommended ? '' : 'bg-yellow-500',
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
                rpf_recommended &&
                  orientation === 'horizontal' &&
                  'before:content-["Recommended"]',
                rpf_recommended &&
                  orientation === 'vertical' &&
                  "after:content-['Recommended'] ",
              ),
            toggleableContent: () =>
              'p-stepper-toggleable-content bg-transparent',
          }}
          header="Reduced Physical Function"
        >
          <div className="flex flex-col gap-7">
            <FunctionalScoreTable data={data.original.nursing_fa_final_entry} />
            <RestorativeNursingTable
              data={data.original.nursing_re_final_entry}
            />
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
  );
}
