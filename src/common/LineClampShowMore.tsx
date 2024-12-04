import { ReactNode, useState, useRef, useEffect } from 'react';

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
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const content = contentRef.current;
      if (content) {
        // Calculate line height and compare with content scroll height
        const style = window.getComputedStyle(content);
        const lineHeight = parseInt(style.lineHeight);
        const maxHeight = lineHeight * maxLines;

        setShowButton(content.scrollHeight > maxHeight);
      }
    };

    checkOverflow();
    // Re-check on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [maxLines, children]);

  return (
    <div className="relative">
      <div
        ref={contentRef}
        className={`relative transition-all duration-300 ease-in-out ${
          !isExpanded ? `overflow-hidden line-clamp-${maxLines}` : ''
        } ${className}`}
        aria-expanded={isExpanded}
      >
        {children}
      </div>

      {showButton && (
        <button
          onClick={(event) => {
            event.preventDefault();
            setIsExpanded(!isExpanded);
          }}
          className="mt-2 text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-500
                     focus:outline-none font-medium rounded-md px-1 py-1 transition-colors
                     bg-white bg-opacity-90"
          aria-label={isExpanded ? 'Show less content' : 'Show more content'}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
}
