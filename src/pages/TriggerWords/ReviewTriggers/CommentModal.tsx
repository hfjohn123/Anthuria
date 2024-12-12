import { Dialog } from 'primereact/dialog';
import { useState } from 'react';
import { ThumbsDown } from '@phosphor-icons/react';
import { Button } from 'primereact/button';
import clsx from 'clsx';
import CommentForm from '../../../components/Forms/CommentForm.tsx';

export default function CommentModal({
  data,
  active,
}: {
  data: {
    comment: string;
    trigger_word: string;
    progress_note_id: number;
  };
  active: boolean;
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        onClick={(event) => {
          event.stopPropagation();
          setShowModal(true);
        }}
        className="bg-transparent border-0 p-0 m-0"
      >
        <ThumbsDown
          className={clsx(
            'size-4 cursor-pointer thumbs_down',
            active ? 'text-meta-1' : 'text-body dark:text-bodydark',
          )}
          weight={active ? 'fill' : 'regular'}
        />
      </Button>
      <Dialog
        header="What was inaccurate about this suggestion?"
        visible={showModal}
        dismissableMask
        resizable
        className="w-[60rem] overflow-hidden"
        onHide={() => {
          if (!showModal) return;
          setShowModal(false);
        }}
        maximizable
      >
        <div>
          <p className="italic">Please help correct this trigger assignment.</p>
          <CommentForm comment={data} setIsOpen={setShowModal} />
        </div>
      </Dialog>
    </>
  );
}
