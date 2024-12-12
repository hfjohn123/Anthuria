import { Stepper, StepperRefAttributes } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import ExtensiveServices from './ExtensiveServices.tsx';
import SpecialCareHigh from './SpecialCareHigh.tsx';
import SpecialCareLow from './SpecialCareLow.tsx';
import ClinicallyComplex from './ClinicallyComplex.tsx';
import FunctionalScoreTable from './FunctionalScoreTable.tsx';
import RestorativeNursingTable from './RestorativeNursingTable.tsx';
import { Row } from '@tanstack/react-table';
import { MDSFinal } from '../../../../types/MDSFinal.ts';
import DepressionIndicator from './DepressionIndicator.tsx';

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
            action: () => 'p-stepper-action p-component bg-transparent',
            toggleableContent: () =>
              'p-stepper-toggleable-content bg-transparent',
          }}
          header="Extensive Services"
        >
          <div className="flex flex-col gap-7">
            <ExtensiveServices />
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
            action: () => 'p-stepper-action p-component bg-transparent',
            toggleableContent: () =>
              'p-stepper-toggleable-content bg-transparent',
          }}
          header="Special Care High"
        >
          <div className="flex flex-col gap-7">
            <SpecialCareHigh />
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
            action: () => 'p-stepper-action p-component bg-transparent',
            toggleableContent: () =>
              'p-stepper-toggleable-content bg-transparent',
          }}
          header="Special Care Low"
        >
          <div className="flex flex-col gap-7">
            <SpecialCareLow />
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
            action: () => 'p-stepper-action p-component bg-transparent',
            toggleableContent: () =>
              'p-stepper-toggleable-content bg-transparent',
          }}
          header="Clinically Complex"
        >
          <div className="flex flex-col gap-7">
            <ClinicallyComplex />
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
            action: () => 'p-stepper-action p-component bg-transparent',
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
              <p className="font-bold">Staff assessment cognitive status:</p>
              <p>Yes/No</p>
            </div>
            <div>
              <p className="font-bold">Behavioral symptoms:</p>
              <p>Yes/No</p>
            </div>
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
            action: () => 'p-stepper-action p-component bg-transparent',
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
