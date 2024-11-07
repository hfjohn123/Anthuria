import { ReactNode, useState } from 'react';

export default function LineClampShowMore({
  maxLines = 3,
  className = '',
  children,
}: {
  maxLines?: number;
  className?: string;
  children: ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  console.log(maxLines);

  return (
    <div className={`relative `}>
      <div
        className={`${
          !isExpanded ? `overflow-hidden line-clamp-${maxLines} ` : ''
        } ${className}`}
      >
        {children}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 text-blue-600 hover:text-blue-800 focus:outline-none font-medium"
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
}
