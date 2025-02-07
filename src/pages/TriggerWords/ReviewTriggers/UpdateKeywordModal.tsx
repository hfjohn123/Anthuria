import { useRef, useState } from 'react';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

import { TriggerFinal } from '../../../types/TriggerFinal.ts';
import { Toast } from 'primereact/toast';

import KeywordForm from './KeywordForm.tsx';
import { Info } from '@phosphor-icons/react';
import { MultiSelect } from 'primereact/multiselect';

export default function UpdateKeywordModal({
  data,
  trigger_words,
  initialNewTrigger,
  header,
  setSelfDefinedKeywordsState,
  resetTableFilters,
  tooltip = 'This is a Self-Defined Category.\nPlease click for more details.',
}: {
  data: TriggerFinal[];
  trigger_words: string[];
  initialNewTrigger: {
    group_name: string;
    trigger_word: string;
    internal_facility_id: string[];
    keyword_list: string[];
  };
  header: string;
  setSelfDefinedKeywordsState?: any;
  resetTableFilters?: () => void;
  tooltip?: string;
}) {
  const toast = useRef<Toast>(null);
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<MultiSelect>(null);

  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      <Button
        className="p-0 bg-transparent border-0"
        tooltip={tooltip}
        tooltipOptions={{ position: 'top' }}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(true);
        }}
      >
        <Info
          weight="fill"
          className="size-6 text-slate-400 hover:text-slate-500"
        />
      </Button>
      <div onClick={(event) => event.stopPropagation()}>
        <Dialog
          header={header}
          visible={isOpen}
          dismissableMask
          resizable
          className="w-[60rem] overflow-hidden"
          blockScroll
          onHide={() => {
            if (!isOpen) return;
            setIsOpen(false);
          }}
          // onClick={(event) => {
          //   if (
          //     !(event.target as HTMLElement).className.includes('p-multiselect')
          //   ) {
          //     formRef.current?.hide();
          //   }
          // }}
          maximizable
        >
          <KeywordForm
            trigger_words={trigger_words}
            toast={toast}
            isNew={false}
            data={data}
            initialNewTrigger={initialNewTrigger}
            ref={formRef}
            callback={() => setIsOpen(false)}
            setSelfDefinedKeywordsState={setSelfDefinedKeywordsState}
            resetTableFilters={resetTableFilters}
          />
        </Dialog>
      </div>
    </>
  );
}
