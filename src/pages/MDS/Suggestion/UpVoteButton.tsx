import { Button } from 'primereact/button';
import { ThumbsUp } from '@phosphor-icons/react';
import clsx from 'clsx';

export default function UpVoteButton({
  is_thumb_up,
}: {
  is_thumb_up: boolean;
}) {
  return (
    <Button className="bg-transparent border-0 p-0 m-0">
      <ThumbsUp
        className={clsx(
          'size-5 cursor-pointer thumbs_up',
          is_thumb_up ? 'text-meta-3' : 'text-body dark:text-bodydark',
        )}
        weight={is_thumb_up ? 'fill' : 'regular'}
      />
    </Button>
  );
}
