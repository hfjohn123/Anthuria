import { Dialog } from 'primereact/dialog';
import { useState } from 'react';
import { ThumbsDown } from '@phosphor-icons/react';
import { Button } from 'primereact/button';
import clsx from 'clsx';
import { useQueryClient } from '@tanstack/react-query';
import CommentForm from './CommentForm.tsx';
import { Comment } from './type/Comment.tsx';

export default function CommentModal({
  data,
  active,
  setThumbUp,
  setCommentState,
}: {
  data: Comment;
  active: boolean;
  setThumbUp: React.Dispatch<React.SetStateAction<boolean>>;
  setCommentState: React.Dispatch<React.SetStateAction<unknown>>;
}) {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    queryClient.cancelQueries({
      queryKey: ['trigger_word_view_trigger_word_detail_final'],
    });
    setShowModal(true);
  };

  const handleDialogHide = () => {
    setShowModal(false);
  };
  return (
    <>
      <Button
        onClick={handleButtonClick}
        className="bg-transparent border-0 p-0 m-0"
      >
        <ThumbsDown
          className={clsx(
            'size-5 cursor-pointer thumbs_down',
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
        blockScroll
        className="w-[60rem] overflow-hidden"
        onHide={handleDialogHide}
        maximizable
      >
        <div>
          <p className="italic">Please help correct this trigger assignment.</p>
          <CommentForm
            comment={data}
            setIsOpen={setShowModal}
            setCommentState={setCommentState}
            setThumbUp={setThumbUp}
          />
        </div>
      </Dialog>
    </>
  );
}
