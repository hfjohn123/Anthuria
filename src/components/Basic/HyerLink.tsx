import { ArrowSquareOut } from '@phosphor-icons/react';
import { Tooltip } from 'react-tooltip';

export default function HyperLink({
  tooltip_content,
  href,
  children,
}: {
  tooltip_content: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="w-max">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-tooltip-id="hyper-tooltip"
          data-tooltip-content={tooltip_content}
          className="flex gap-2 items-center flex-nowrap"
        >
          <ArrowSquareOut />
          {children}
        </a>
        <Tooltip id="hyper-tooltip" className="font-bold" />
      </div>
    </>
  );
}
