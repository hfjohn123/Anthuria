import { Dialog } from 'primereact/dialog';
import { useContext, useState } from 'react';
import { ThumbsDown } from '@phosphor-icons/react';
import { Button } from 'primereact/button';
import clsx from 'clsx';
import CommentForm from '../../../components/Forms/CommentForm.tsx';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../../components/AuthWrapper.tsx';

export default function CommentModal({
  data,
  active,
  setThumbUp,
  setCommentState,
}: {
  data: {
    comment: string;
    trigger_word: string;
    progress_note_id: number;
  };
  active: boolean;
  setThumbUp: any;
  setCommentState: any;
}) {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();
  const { route } = useContext(AuthContext);
  return (
    <>
      <Button
        onClick={(event) => {
          event.stopPropagation();
          queryClient.cancelQueries({
            queryKey: ['trigger_word_view_trigger_word_detail_final', route],
          });
          setShowModal(true);
        }}
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
        className="w-[60rem] overflow-hidden"
        onHide={() => {
          if (!showModal) return;
          setShowModal(false);
        }}
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
