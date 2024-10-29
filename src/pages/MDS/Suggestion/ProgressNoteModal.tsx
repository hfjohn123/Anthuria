import { useState } from 'react';
import Modal from '../../../components/Modal/Modal.tsx';
import { ProgressNoteAndSummary } from '../../../types/MDSFinal.ts';

export default function ProgressNoteModal({
  progressNoteAndSummary,
}: {
  progressNoteAndSummary: ProgressNoteAndSummary[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Modal
      isOpen={open}
      setIsOpen={setOpen}
      button={<span className="text-primary">Expand</span>}
      title={'Progress Note and Explanation'}
    >
      <div className="flex py-3 pl-6 flex-col  sm:max-w-[60vw] max-h-[80vh] overflow-y-auto">
        {progressNoteAndSummary.map((progressNoteAndSummary) => (
          <div
            key={progressNoteAndSummary.highlights}
            className="flex flex-col gap-3 border-b  border-stroke dark:border-strokedark last:border-b-0"
          >
            <h3 className="font-bold  text-xl">
              {progressNoteAndSummary.highlights}
            </h3>
            <p className="italic">
              <span className="font-semibold">Explanation:</span>{' '}
              {progressNoteAndSummary.explanation}
            </p>
            <p className="whitespace-pre-wrap">
              <span className="font-semibold">Progress Note:</span>{' '}
              {progressNoteAndSummary.progress_note}
            </p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
