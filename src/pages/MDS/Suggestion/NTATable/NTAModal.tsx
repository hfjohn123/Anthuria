import { useState } from 'react';
import Modal from '../../../../components/Modal/Modal.tsx';
import { SuggestedICD10 } from '../../../../types/MDSFinal.ts';
import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import LineClampShowMore from '../../../../common/LineClampShowMore.tsx';
export default function NTAModal({ icd10 }: { icd10: SuggestedICD10 }) {
  const [open, setOpen] = useState(false);

  return (
    <Modal
      isOpen={open}
      setIsOpen={setOpen}
      button={<span className="text-primary">{icd10.icd10}</span>}
      title={'Suggestion for ' + icd10.icd10}
    >
      <div className="flex py-3 pl-6 flex-col  sm:max-w-[60vw] max-h-[80vh] overflow-y-auto">
        <div
          key={icd10.icd10}
          className="flex flex-col gap-3 border-b  border-stroke dark:border-strokedark last:border-b-0"
        >
          <div>
            <h3 className="font-bold  text-md">Review:</h3>
            <div className="flex items-center gap-2">
              <ThumbsUp className="size-5" />
              <ThumbsDown className="size-5" />
            </div>
          </div>
          <div>
            <h3 className="font-bold  text-md">Explanation and Evidence:</h3>
            {icd10.progress_note.map((item) => (
              <div
                key={item.highlights}
                className="flex flex-col gap-3 border-b  border-stroke dark:border-strokedark last:border-b-0 pr-4"
              >
                <h3 className="font-bold  text-xl">{item.highlights}</h3>
                <p className="italic">
                  <span className="font-semibold">Explanation:</span>{' '}
                  {item.explanation}
                </p>

                <LineClampShowMore className="whitespace-pre-wrap" maxLines={6}>
                  <p>
                    <span className="font-semibold">Progress Note:</span>{' '}
                    {item.progress_note}
                  </p>
                </LineClampShowMore>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
