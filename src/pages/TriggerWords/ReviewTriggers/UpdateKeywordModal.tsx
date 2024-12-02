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
}: {
  data: TriggerFinal[];
  trigger_words: string[];
  initialNewTrigger: {
    trigger_word: string;
    internal_facility_id: string[];
    keyword_list: string[];
  };
  header: string;
}) {
  const toast = useRef<Toast>(null);
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<MultiSelect>(null);

  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      <Button
        className="absolute top-1 right-1 p-0 bg-transparent border-0"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(true);
        }}
      >
        <Info
          weight="fill"
          className="size-6 text-slate-300 hover:text-slate-400"
        />
      </Button>
      <div onClick={(event) => event.stopPropagation()}>
        <Dialog
          header={header}
          visible={isOpen}
          dismissableMask
          resizable
          className="w-[60rem] overflow-hidden"
          onHide={() => {
            if (!isOpen) return;
            setIsOpen(false);
          }}
          onClick={(event) => {
            if (
              !(event.target as HTMLElement).className.includes('p-multiselect')
            ) {
              formRef.current?.hide();
            }
          }}
          maximizable
        >
          <KeywordForm
            trigger_words={trigger_words}
            toast={toast}
            data={data}
            initialNewTrigger={initialNewTrigger}
            ref={formRef}
            callback={() => setIsOpen(false)}
          />
        </Dialog>
      </div>
    </>
  );
}
