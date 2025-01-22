import { useRef, useState } from 'react';

import { Dialog } from 'primereact/dialog';

import { TriggerFinal } from '../../../types/TriggerFinal.ts';
import { Toast } from 'primereact/toast';

import KeywordForm from './KeywordForm.tsx';

const initialNewTrigger: {
  group_name: string;
  trigger_word: string;
  internal_facility_id: string[];
  keyword_list: string[];
} = {
  group_name: '',
  trigger_word: '',
  internal_facility_id: [],
  keyword_list: [],
  // date_range: [new Date(), new Date()],
};

export default function NewTriggerWordModal({
  data,
  trigger_words,
  setSelfDefinedKeywordsState,
}: {
  data: TriggerFinal[];
  trigger_words: string[];
  setSelfDefinedKeywordsState: any;
}) {
  const toast = useRef<Toast>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      <span
        className="p-1 bg-transparent border-0 text-primary dark:text-secondary font-normal text-base underline"
        role="button"
        onClick={() => setIsOpen(true)}
      >
        Add New Trigger
      </span>
      <Dialog
        header="Create a New Trigger Word"
        visible={isOpen}
        dismissableMask
        resizable
        className="w-[60rem] overflow-hidden"
        onHide={() => {
          if (!isOpen) return;
          setIsOpen(false);
        }}
        maximizable
      >
        <KeywordForm
          trigger_words={trigger_words}
          toast={toast}
          data={data}
          isNew
          initialNewTrigger={initialNewTrigger}
          callback={() => setIsOpen(false)}
          setSelfDefinedKeywordsState={setSelfDefinedKeywordsState}
        />
      </Dialog>
    </>
  );
}
