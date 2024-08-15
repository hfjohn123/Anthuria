import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

export default function ErrorPage({
  error,
  children,
}: {
  error: string;
  children?: ReactNode;
}) {
  return (
    <>
      {createPortal(
        <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-boxdark-2 flex-col gap-20">
          <h1 className="text-4xl font-bold text-gray-500 dark:text-gray-300">
            {error}
          </h1>
          {children !== null && children}
        </div>,
        document.body,
      )}
    </>
  );
}
