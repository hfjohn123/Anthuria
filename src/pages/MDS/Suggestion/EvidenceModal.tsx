import { useState, useRef, useEffect, useContext } from 'react';
import { SuggestedICD10 } from '../../../types/MDSFinal.ts';
import { CaretUp, CaretDown } from '@phosphor-icons/react';
import NTAProgressNote from './NTATable/NTAProgressNote.tsx';
import clsx from 'clsx';
import highlightColors from '../../../common/highlightColors.ts';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { MDSPatientContext } from './MDSDetailLoading.tsx';

export const handleClick = (
  source_id: number,
  url_header: string,
  patient_id: string,
  internal_facility_id: string,
) => {
  const win1 = window.open('example.com', '_blank');

  try {
    // Open initial window

    if (!win1) {
      alert('Pop-up was blocked. Please allow pop-ups and try again.');
      return;
    }

    // Handle the first navigation
    win1.onload = function () {
      try {
        const clientListUrl = `https://${url_header}.pointclickcare.com/admin/client/clientlist.jsp?ESOLtabtype=C&ESOLglobalclientsearch=Y&ESOLclientid=${patient_id}&ESOLfacid=${internal_facility_id.split('_').pop()}&ESOLsave=P`;

        // Navigate to second URL
        win1.open(clientListUrl);

        setTimeout(() => {
          win1.close();
          const chartUrl = `https:///${url_header}.pointclickcare.com/care/chart/ipn/newipn.jsp?ESOLpnid=${source_id}&ESOLclientid=${patient_id}`;
          const win2 = window.open(chartUrl);
          if (!win2) {
            alert('Pop-up was blocked. Please allow pop-ups and try again.');
          }
        }, 1000);

        // Handle the second navigation
      } catch (error) {
        console.error('Error during second navigation:', error);
        alert(
          'Failed to navigate to the client list. The window may need to be closed manually.',
        );
      }
    };
  } catch (error) {
    console.error('Error initiating window sequence:', error);
    alert('An error occurred while trying to show evidence.');
  }
};

export default function EvidenceModal({
  icd10,
  button,
}: {
  icd10: SuggestedICD10;
  button: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastScrollTop = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('down');
  const patientInfo = useContext(MDSPatientContext);

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
        block: 'nearest',
      });
      setCurrentIndex(nextIndex);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-transparent border-0 text-primary p-0"
      >
        {button}
      </Button>
      <Dialog
        visible={open}
        dismissableMask
        maximized={isMaximized}
        // resizable
        // maximizable
        onHide={() => setOpen(false)}
        header={'Suggestion for ' + icd10.icd10}
        className="w-[60rem] "
        contentClassName="relative"
        pt={{
          content: () => 'pr-0 pb-0',
        }}
        blockScroll
        onMaximize={(e) => setIsMaximized(e.maximized)}
      >
        {/* Navigation buttons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end gap-2 z-50">
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

        {/* Scrollable content */}
        <div
          ref={scrollContainerRef}
          className={clsx(
            'flex py-3 pl-6 pr-16 flex-col ',
            !isMaximized && 'max-h-[70vh] overflow-y-auto',
          )}
        >
          <div className="flex flex-col gap-3 border-b border-stroke dark:border-strokedark last:border-b-0">
            <div>
              <h3 className="font-bold text-md">Explanation and Evidence:</h3>
              {icd10.progress_note.map((item, index) => {
                if (item.source_category === 'P' && item.highlights)
                  return (
                    <div
                      key={item.source_category + item.source_id}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      className={clsx(
                        'flex flex-col gap-3 border-b border-stroke dark:border-strokedark last:border-b-0 pr-4 py-4',
                        'scroll-mt-4 transition-colors duration-200',
                        index === currentIndex &&
                          'bg-gray-50/50 dark:bg-gray-800/50',
                      )}
                    >
                      <div>
                        <h3 className="font-bold text-xl">
                          {item.highlights.split('|').map((h, hIndex, arr) => (
                            <span key={hIndex}>
                              <span
                                className={clsx(
                                  highlightColors[
                                    hIndex % highlightColors.length
                                  ],
                                  'px-1 rounded',
                                )}
                              >
                                {h.trim()}
                              </span>
                              {hIndex !== arr.length - 1 && ' | '}
                            </span>
                          ))}
                        </h3>
                        <div className="flex justify-end">
                          <Button
                            className="bg-transparent border-0 text-primary p-1 ml-auto"
                            onClick={() =>
                              handleClick(
                                item.source_id,
                                patientInfo.url_header,
                                patientInfo.patient_id,
                                patientInfo.internal_facility_id,
                              )
                            }
                          >
                            Click to PCC
                          </Button>
                        </div>
                      </div>
                      <p className="italic">
                        <span className="font-semibold">Explanation:</span>{' '}
                        {item.explanation}
                      </p>

                      <NTAProgressNote progress_note={item} />
                    </div>
                  );
                if (item.source_category === 'D')
                  return (
                    <div
                      key={item.source_category + item.source_id}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      className={clsx(
                        'flex flex-col gap-3 border-b border-stroke dark:border-strokedark last:border-b-0 pr-4 py-4',
                        'scroll-mt-4 transition-colors duration-200',
                        index === currentIndex &&
                          'bg-gray-50/50 dark:bg-gray-800/50',
                      )}
                    >
                      <h3 className="font-bold text-xl">
                        Diagnosis about {icd10.icd10}
                      </h3>
                      <p className="italic">{item.explanation}</p>
                    </div>
                  );
                if (item.source_category === 'PO')
                  return (
                    <div
                      key={item.source_category + item.source_id}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      className={clsx(
                        'flex flex-col gap-3 border-b border-stroke dark:border-strokedark last:border-b-0 pr-4 py-4',
                        'scroll-mt-4 transition-colors duration-200',
                        index === currentIndex &&
                          'bg-gray-50/50 dark:bg-gray-800/50',
                      )}
                    >
                      <h3 className="font-bold text-xl">
                        Physician Order about {icd10.icd10}
                      </h3>
                      <p className="italic">{item.explanation}</p>
                    </div>
                  );
                if (item.source_category === 'A')
                  return (
                    <div
                      key={item.source_category + item.source_id}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      className={clsx(
                        'flex flex-col gap-3 border-b border-stroke dark:border-strokedark last:border-b-0 pr-4 py-4',
                        'scroll-mt-4 transition-colors duration-200',
                        index === currentIndex &&
                          'bg-gray-50/50 dark:bg-gray-800/50',
                      )}
                    >
                      <h3 className="font-bold text-xl">
                        Assessment about {icd10.icd10}
                      </h3>
                      <p className="italic">{item.explanation}</p>
                    </div>
                  );
              })}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
