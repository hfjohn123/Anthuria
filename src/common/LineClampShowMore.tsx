import { ReactNode, useState, useRef, useEffect, CSSProperties } from 'react';

export default function LineClampShowMore({
  maxLines = 6,
  className = '',
  children,
}: {
  maxLines?: number;
  className?: string;
  children: ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentElement = contentElementRef.current;

    const checkOverflow = () => {
      if (contentElement) {
        const style = getComputedStyle(contentElement);
        const lineHeight = parseInt(style.lineHeight, 10);
        const maxHeight = lineHeight * maxLines;

        setShouldShowButton(contentElement.scrollHeight > maxHeight);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    if (contentElement) {
      resizeObserver.observe(contentElement);
      return () => {
        resizeObserver.unobserve(contentElement);
      };
    }
  }, [maxLines, children]);

  const lineClampStyle: CSSProperties = !isExpanded
    ? ({
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      } as CSSProperties)
    : {};

  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative">
      <div
        ref={contentElementRef}
        style={lineClampStyle}
        className={`relative transition-all duration-300 ease-in-out ${className}`}
        aria-expanded={isExpanded}
      >
        {children}
      </div>

      {shouldShowButton && (
        <button
          className="mt-1 text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-500
                     focus:outline-none font-medium rounded-md transition-colors
                     bg-transparent"
          aria-label={isExpanded ? 'Show less content' : 'Show more content'}
          onClick={handleToggle}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
}
