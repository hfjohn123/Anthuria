import { useState } from 'react';
import { ThumbsDown } from '@phosphor-icons/react';
import { Button } from 'primereact/button';
import clsx from 'clsx';
import { Dialog } from 'primereact/dialog';
import MDSCommentForm from './MDSCommentForm.tsx';

export default function MDSCommentModal({
  comment,
  is_thumb_down,
}: {
  comment: string;
  is_thumb_down: boolean;
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
            'size-5 cursor-pointer thumbs_down hover:text-red-500',
            is_thumb_down ? 'text-red-500' : 'text-body dark:text-bodydark',
          )}
          weight={is_thumb_down ? 'fill' : 'regular'}
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
          <p className="italic">Please help correct this PDPM suggestion.</p>
          <MDSCommentForm comment={comment} setIsOpen={setShowModal} />
        </div>
      </Dialog>
    </>
  );
}
