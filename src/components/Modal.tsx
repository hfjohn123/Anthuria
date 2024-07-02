import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import classNames from 'classnames';

export default function Modal({
  children,
  isOpen,
  setIsOpen,
  title,
  classNameses,
}: {
  children: JSX.Element;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  classNameses?: {
    title?: string;
    button?: string;
  };
}) {
  return (
    <>
      <button className={classNameses?.button} onClick={() => setIsOpen(true)}>
        + Add a New Trigger Word
      </button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-999999"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30 " />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="max-w-lg space-y-4 rounded-md bg-white dark:bg-slate-700 p-12">
            <DialogTitle
              className={classNames('text-2xl font-bold', classNameses?.title)}
            >
              {title}
            </DialogTitle>
            {children}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
