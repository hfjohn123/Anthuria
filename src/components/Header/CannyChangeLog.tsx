import { useEffect } from 'react';
import { MegaphoneIcon } from '@heroicons/react/24/outline';
import { Button } from '@headlessui/react';

export default function CannyChangeLog({ colorMode }: { colorMode: string }) {
  useEffect(() => {
    // @ts-expect-error Canny integration
    Canny('initChangelog', {
      appID: '66577caeac17c62e53e3940f',
      position: 'bottom',
      align: window.innerWidth > 1024 ? 'left' : 'right',
      theme: colorMode, // options: light [default], dark, auto
    });
    return () => {
      // @ts-expect-error Canny integration
      Canny('closeChangelog');
    };
  }, [colorMode]);
  return (
    <Button
      data-canny-changelog
      className="relative flex size-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
    >
      <MegaphoneIcon className="size-5 duration-300 ease-in-out" />
    </Button>
  );
}
