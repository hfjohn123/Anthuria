import { useState, useRef, useEffect } from 'react';
import Modal from '../../../../components/Modal/Modal.tsx';
import { SuggestedICD10 } from '../../../../types/MDSFinal.ts';
import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import { CaretUp, CaretDown } from '@phosphor-icons/react';
import NTAProgressNote from './NTAProgressNote.tsx';
import clsx from 'clsx';
import highlightColors from '../../../../common/highlightColors.ts';

export default function NTAModal({ icd10 }: { icd10: SuggestedICD10 }) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastScrollTop = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    const handleScroll = () => {
      if (scrollContainer) {
        const currentScrollTop = scrollContainer.scrollTop;

        scrollDirection.current =
          currentScrollTop > lastScrollTop.current ? 'down' : 'up';
        lastScrollTop.current = currentScrollTop;
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [scrollContainerRef.current]);

  useEffect(() => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const index = itemRefs.current.findIndex(
                  (ref) => ref === entry.target,
                );
                if (index !== -1) {
                  setCurrentIndex(index);
                }
              }
            });
          },
          {
            threshold: 0,
            root: scrollContainerRef.current,
            rootMargin:
              scrollDirection.current === 'down'
                ? '-100% 0px 0px 0px' // Only observe bottom edge when scrolling down
                : '0px 0px -100% 0px', // Only observe top edge when scrolling up
          },
        );

        itemRefs.current.forEach((ref) => {
          if (ref) observerRef.current?.observe(ref);
        });
      }
    }, 0);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [
    icd10.progress_note,
    open,
    scrollDirection.current,
    scrollContainerRef.current,
  ]);

  const scrollToItem = (direction: 'next' | 'prev') => {
    const totalItems = icd10.progress_note.length;
    let nextIndex;

    if (direction === 'next') {
      nextIndex = Math.min(currentIndex + 1, totalItems - 1);
    } else {
      nextIndex = Math.max(currentIndex - 1, 0);
    }

    if (nextIndex !== currentIndex && itemRefs.current[nextIndex]) {
      itemRefs.current[nextIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setCurrentIndex(nextIndex);
    }
  };

  // Rest of your component remains the same
  return (
    <Modal
      isOpen={open}
      setIsOpen={setOpen}
      button={<span className="text-primary">{icd10.icd10}</span>}
      title={'Suggestion for ' + icd10.icd10}
    >
      <div className="relative">
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col items-end gap-2 z-10">
          <button
            onClick={() => scrollToItem('prev')}
            disabled={currentIndex === 0}
            aria-label="Previous item"
          >
            <CaretUp
              className={clsx(
                'p-2 rounded-full transition-all duration-200 backdrop-blur-sm size-9',
                currentIndex === 0
                  ? 'bg-slate-400/30 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800/30 hover:bg-slate-800/50 text-white',
              )}
            />
          </button>
          <span className="text-center text-xs text-slate-500 bg-white/80 rounded-full px-2 py-1 backdrop-blur-sm">
            {currentIndex + 1}/{icd10.progress_note.length}
          </span>
          <button
            onClick={() => scrollToItem('next')}
            disabled={currentIndex === icd10.progress_note.length - 1}
            aria-label="Next item"
          >
            <CaretDown
              className={clsx(
                'p-2 rounded-full transition-all duration-200 backdrop-blur-sm size-9',
                currentIndex === icd10.progress_note.length - 1
                  ? 'bg-slate-400/30 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800/30 hover:bg-slate-800/50 text-white',
              )}
            />
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex py-3 pl-6 flex-col sm:max-w-[60vw] max-h-[80vh] overflow-y-auto pr-12"
        >
          <div className="flex flex-col gap-3 border-b border-stroke dark:border-strokedark last:border-b-0">
            <div>
              <h3 className="font-bold text-md">Review:</h3>
              <div className="flex items-center gap-2">
                <ThumbsUp className="size-5" />
                <ThumbsDown className="size-5" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-md">Explanation and Evidence:</h3>
              {icd10.progress_note.map((item, index) => (
                <div
                  key={item.highlights}
                  ref={(el) => (itemRefs.current[index] = el)}
                  className={clsx(
                    'flex flex-col gap-3 border-b border-stroke dark:border-strokedark last:border-b-0 pr-4 py-4',
                    'scroll-mt-4 transition-colors duration-200',
                    index === currentIndex &&
                      'bg-gray-50/50 dark:bg-gray-800/50',
                  )}
                >
                  <h3 className="font-bold text-xl">
                    {item.highlights.split('|').map((h, hIndex) => (
                      <span key={hIndex}>
                        <span
                          className={clsx(
                            highlightColors[hIndex % highlightColors.length],
                            'px-1 rounded',
                          )}
                        >
                          {h.trim()}
                        </span>
                        {hIndex !== item.highlights.split('|').length - 1 &&
                          ' | '}
                      </span>
                    ))}
                  </h3>
                  <p className="italic">
                    <span className="font-semibold">Explanation:</span>{' '}
                    {item.explanation}
                  </p>

                  <NTAProgressNote progress_note={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
