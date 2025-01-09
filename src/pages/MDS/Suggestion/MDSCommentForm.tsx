import { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { FloatLabel } from 'primereact/floatlabel';

export default function MDSCommentForm({
  comment,
  setIsOpen,
  internal_facility_id,
  internal_patient_id,
  category,
  item,
  commentMutation,
}: {
  comment: string;
  setIsOpen: any;
  internal_facility_id: string;
  internal_patient_id: string;
  category: string;
  item: string;

  commentMutation: any;
}) {
  const [commentState, setCommentState] = useState(comment);
  return (
    <form
      className="flex flex-col gap-5 justify-center w-full px-4"
      autoFocus
      onSubmit={(e) => {
        e.preventDefault();
        commentMutation.mutate({
          internal_facility_id,
          internal_patient_id,
          category,
          item,
          comment: commentState,
        });
        setIsOpen(false);
        // e.stopPropagation();
      }}
    >
      <FloatLabel className="mt-7">
        <InputTextarea
          className="w-full border border-stroke rounded-md focus:outline-primary p-2 dark:bg-boxdark dark:border-strokedark dark:outline-secondary"
          value={commentState}
          onChange={(e) => {
            setCommentState(() => e.target.value);
          }}
          autoResize
          rows={5}
          placeholder="Please Enter Your Comment Here"
        />
        <label>Comment</label>
      </FloatLabel>
      <div className="flex gap-4 justify-end">
        <button
          type="reset"
          className="dark:text-bodydark1"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          Cancel
        </button>
        <button className="bg-primary text-white dark:text-bodydark1 rounded p-2 dark:bg-secondary">
          Submit
        </button>
      </div>
    </form>
  );
}
