import { useRef, useState } from 'react';

import { Dialog } from 'primereact/dialog';

import {
  selfDefinedKeyword,
  TriggerFinal,
} from '../../../types/TriggerFinal.ts';
import { Toast } from 'primereact/toast';

import KeywordForm from './KeywordForm.tsx';
import { Button } from 'primereact/button';

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
  setSelfDefinedKeywordsState: React.Dispatch<
    React.SetStateAction<selfDefinedKeyword[]>
  >;
}) {
  const toast = useRef<Toast>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Toast ref={toast} position="bottom-center" />
      <div
        className="flex items-center justify-center py-4.5  rounded-[30px] px-7.5 bg-whiten dark:bg-boxdark-2 hover:bg-slate-200 hover:dark:bg-slate-700 min-h-[99px]"
        onClick={() => setIsOpen(true)}
        role="button"
      >
        <Button
          label="Add New Trigger Word"
          className="p-1 bg-transparent border-0 text-primary dark:text-secondary   "
          icon="pi pi-plus"
        ></Button>
      </div>
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
        blockScroll
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
