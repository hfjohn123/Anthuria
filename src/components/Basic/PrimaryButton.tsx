import { Button } from '@headlessui/react';
import { ReactNode } from 'react';
export default function PrimaryButton({
  children,
  ...props
}: {
  children: ReactNode;
  [x: string]: any;
}) {
  return (
    <Button
      className="bg-primary text-white py-1 px-2 rounded data-[disabled]:bg-[#D9D9D9] data-[disabled]:text-[#E2E8F0]"
      {...props}
    >
      {children}
    </Button>
  );
}
