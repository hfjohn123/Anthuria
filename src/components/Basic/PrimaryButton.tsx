import { Button } from '@headlessui/react';
import { ReactNode } from 'react';
import clsx from 'clsx';
export default function PrimaryButton({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  [x: string]: any;
}) {
  return (
    <Button
      className={clsx(
        'bg-primary text-white py-1 px-2 rounded data-[disabled]:bg-[#D9D9D9] data-[disabled]:text-[#E2E8F0] hover:bg-opacity-90 ',
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
