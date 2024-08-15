import {
  Button,
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
  button,
  classNameses,
  onOpenCallback,
  onCloseCallback,
}: {
  children: JSX.Element;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  button: JSX.Element;
  classNameses?: {
    title?: string;
    button?: string;
  };
  onOpenCallback?: () => void;
  onCloseCallback?: () => void;
}) {
  return (
    <>
      <Button
        className={classNameses?.button}
        onClick={() => {
          setIsOpen(true);
          onOpenCallback && onOpenCallback();
        }}
        type="button"
      >
        {button}
      </Button>
      <Dialog
        open={isOpen}
        onClose={() => {
          onCloseCallback && onCloseCallback();
          setIsOpen(false);
        }}
        className="relative"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30 z-999" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4 z-999">
          <DialogPanel className="space-y-4 rounded-md bg-white dark:bg-slate-700 p-12">
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
