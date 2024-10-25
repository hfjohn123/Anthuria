import { ArrowSquareOut } from '@phosphor-icons/react';
import { Tooltip } from 'react-tooltip';

export default function HyperLink({
  tooltip_content,
  href,
  className = '',
  children,
  ...props
}: {
  tooltip_content?: string;
  href: string;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
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
          onClick={(event) => event.stopPropagation()}
          className={
            className +
            ' flex gap-1 items-center flex-nowrap underline HyperLink'
          }
          {...props}
        >
          {children}
          <ArrowSquareOut className="size-4" />
        </a>
        <Tooltip id="hyper-tooltip" className="font-bold z-99" />
      </div>
    </>
  );
}
