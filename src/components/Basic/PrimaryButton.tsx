import { Button } from '@headlessui/react';

export default function PrimaryButton({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  return (
    <Button className="bg-primary text-white py-1 px-2 rounded" {...props}>
      {children}
    </Button>
  );
}
