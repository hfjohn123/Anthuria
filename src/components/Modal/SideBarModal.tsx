import {
  Button,
  CloseButton,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import classNames from 'classnames';
import { memo } from 'react';
import { X } from '@phosphor-icons/react';

const Modal = memo(function Modal({
  children,
  isOpen,
  setIsOpen,
  title,
  button,
  hasCloseButton = true,
  classNameses,
  onOpenCallback,
  onCloseCallback,
  disabled = false,
}: {
  children: JSX.Element;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  button: JSX.Element;
  hasCloseButton?: boolean;
  classNameses?: {
    title?: string;
    button?: string;
  };
  onOpenCallback?: () => void;
  onCloseCallback?: () => void;
  disabled?: boolean;
}) {
  return (
    <>
      <Button
        className={'group ' + classNameses?.button}
        onClick={() => {
          setIsOpen(true);
          onOpenCallback && onOpenCallback();
        }}
        type="button"
        disabled={disabled}
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
        <div className="fixed inset-0 w-screen overflow-y-auto z-999">
          <div className="flex min-h-full justify-center sm:justify-end">
            <DialogPanel className=" bg-white dark:bg-slate-700">
              <div className="flex items-center justify-between border-b p-4">
                <DialogTitle
                  className={classNames(
                    'text-2xl font-bold',
                    classNameses?.title,
                  )}
                >
                  {title}
                </DialogTitle>
                {hasCloseButton && (
                  <CloseButton>
                    <X className="size-6 hover:text-primary" />
                  </CloseButton>
                )}
              </div>
              <div className="pb-4 sm:max-w-[80vw]">{children}</div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
});

export default Modal;
