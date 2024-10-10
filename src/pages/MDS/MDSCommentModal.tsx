import Modal from '../../components/Modal/Modal.tsx';
import { useState } from 'react';
import { ThumbsDown } from '@phosphor-icons/react';
import { Button, Field, Label, Textarea } from '@headlessui/react';
import clsx from 'clsx';

export default function MDSCommentModal({
  comment,
  is_thumb_up,
}: {
  comment: string;
  is_thumb_up: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [commentState, setCommentState] = useState(comment);

  return (
    <Modal
      isOpen={showModal}
      setIsOpen={setShowModal}
      classNameses={{
        title: 'text-xl sm:text-2xl',
      }}
      title={'What is Going Wrong?'}
      button={
        <ThumbsDown
          className={clsx(
            'size-4 cursor-pointer',
            comment && !is_thumb_up && 'text-meta-1',
          )}
          weight={comment && !is_thumb_up ? 'fill' : 'regular'}
        />
      }
    >
      <form
        className="flex flex-col gap-5 px-4 justify-center w-full sm:w-[480px]"
        autoFocus
      >
        <Field>
          <Label className="mb-1">Comment</Label>
          <Textarea
            className="w-full border border-stroke rounded-md focus:outline-primary p-2 dark:bg-boxdark dark:border-strokedark dark:outline-secondary"
            value={commentState}
            onChange={(e) => {
              setCommentState(e.target.value);
            }}
            placeholder="Please Enter Your Comment Here"
          />
        </Field>
        <div className="flex gap-4 justify-end">
          <Button
            type="reset"
            className="dark:text-bodydark1"
            onClick={() => {
              setShowModal(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-white dark:text-bodydark1 rounded p-2 dark:bg-secondary"
          >
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
}
