import { useState, useRef, useEffect, useContext, useCallback, memo } from 'react';
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

  if (!win1) {
    alert('Pop-up was blocked. Please allow pop-ups and try again.');
    return;
  }

  try {
    win1.onload = function () {
      try {
        const clientListUrl = `https://${url_header}.pointclickcare.com/admin/client/clientlist.jsp?ESOLtabtype=C&ESOLglobalclientsearch=Y&ESOLclientid=${patient_id}&ESOLfacid=${internal_facility_id.split('_').pop()}&ESOLsave=P`;
        win1.open(clientListUrl);

        setTimeout(() => {
          win1.close();
          const chartUrl = `https:///${url_header}.pointclickcare.com/care/chart/ipn/newipn.jsp?ESOLpnid=${source_id}&ESOLclientid=${patient_id}`;
          const win2 = window.open(chartUrl);
          if (!win2) {
            alert('Pop-up was blocked. Please allow pop-ups and try again.');
          }
        }, 1000);
      } catch (error) {
        console.error('Error during second navigation:', error);
        alert('Failed to navigate to the client list. The window may need to be closed manually.');
      }
    };
  } catch (error) {
    console.error('Error initiating window sequence:', error);
    alert('An error occurred while trying to show evidence.');
  }
};

const NavigationButton = memo(({ direction, onClick, disabled, currentIndex, total }: {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled: boolean;
  currentIndex?: number;
  total?: number;
}) => (
  <>
    <button onClick={onClick} disabled={disabled} aria-label={`${direction === 'prev' ? 'Previous' : 'Next'} item`}>
      {direction === 'prev' ? (
        <CaretUp className={clsx(
          'p-2 rounded-full transition-all duration-200 backdrop-blur-sm size-9',
          disabled ? 'bg-slate-400/30 text-slate-500 cursor-not-allowed' : 'bg-slate-800/30 hover:bg-slate-800/50 text-white'
        )} />
      ) : (
        <CaretDown className={clsx(
          'p-2 rounded-full transition-all duration-200 backdrop-blur-sm size-9',
          disabled ? 'bg-slate-400/30 text-slate-500 cursor-not-allowed' : 'bg-slate-800/30 hover:bg-slate-800/50 text-white'
        )} />
      )}
    </button>
    {currentIndex !== undefined && total !== undefined && (
      <span className="text-center text-xs text-slate-500 bg-white/80 rounded-full px-2 py-1 backdrop-blur-sm">
        {currentIndex + 1}/{total}
      </span>
    )}
  </>
));

const EvidenceContent = memo(({ icd10, currentIndex, itemRefs, patientInfo }: {
  icd10: SuggestedICD10;
  currentIndex: number;
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  patientInfo: any;
}) => (
  <>
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
              index === currentIndex && 'bg-gray-50/50 dark:bg-gray-800/50'
            )}
          >
            <div>
              <h3 className="font-bold text-xl">
                {item.highlights.split('|').map((h, hIndex, arr) => (
                  <span key={hIndex}>
                    <span className={clsx(highlightColors[hIndex % highlightColors.length], 'px-1 rounded')}>
                      {h.trim()}
                    </span>
                    {hIndex !== arr.length - 1 && ' | '}
                  </span>
                ))}
              </h3>
              <div className="flex justify-end">
                <Button
                  className="bg-transparent border-0 text-primary p-1 ml-auto"
                  onClick={() => handleClick(
                    item.source_id,
                    patientInfo.url_header,
                    patientInfo.patient_id,
                    patientInfo.internal_facility_id
                  )}
                >
                  Click to PCC
                </Button>
              </div>
            </div>
            <p className="italic">
              <span className="font-semibold">Explanation:</span> {item.explanation}
            </p>
            <NTAProgressNote progress_note={item} />
          </div>
        );

      const categoryTitles = {
        D: 'Diagnosis',
        PO: 'Physician Order',
        A: 'Assessment'
      };

      const category = item.source_category as keyof typeof categoryTitles;
      if (categoryTitles[category]) {
        return (
          <div
            key={item.source_category + item.source_id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={clsx(
              'flex flex-col gap-3 border-b border-stroke dark:border-strokedark last:border-b-0 pr-4 py-4',
              'scroll-mt-4 transition-colors duration-200',
              index === currentIndex && 'bg-gray-50/50 dark:bg-gray-800/50'
            )}
          >
            <h3 className="font-bold text-xl">
              {categoryTitles[category]} about {icd10.icd10}
            </h3>
            <p className="italic">{item.explanation}</p>
          </div>
        );
      }
      return null;
    })}
  </>
));

function EvidenceModal({
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

  const handleScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const currentScrollTop = scrollContainer.scrollTop;
      scrollDirection.current = currentScrollTop > lastScrollTop.current ? 'down' : 'up';
      lastScrollTop.current = currentScrollTop;
    }
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollContainerRef.current && open) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const index = itemRefs.current.findIndex((ref) => ref === entry.target);
                if (index !== -1) setCurrentIndex(index);
              }
            });
          },
          {
            threshold: 0,
            root: scrollContainerRef.current,
            rootMargin: scrollDirection.current === 'down' ? '-100% 0px 0px 0px' : '0px 0px -100% 0px',
          }
        );

        itemRefs.current.forEach((ref) => {
          if (ref) observerRef.current?.observe(ref);
        });
      }
    }, 0);

    return () => {
      clearTimeout(timeout);
      observerRef.current?.disconnect();
    };
  }, [icd10.progress_note, open]);

  const scrollToItem = useCallback((direction: 'next' | 'prev') => {
    const totalItems = icd10.progress_note.length;
    const nextIndex = direction === 'next' 
      ? Math.min(currentIndex + 1, totalItems - 1)
      : Math.max(currentIndex - 1, 0);

    if (nextIndex !== currentIndex && itemRefs.current[nextIndex]) {
      itemRefs.current[nextIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, icd10.progress_note.length]);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-transparent border-0 text-primary p-0">
        {button}
      </Button>
      <Dialog
        visible={open}
        dismissableMask
        maximized={isMaximized}
        onHide={() => setOpen(false)}
        header={'Suggestion for ' + icd10.icd10}
        className="w-[60rem]"
        contentClassName="relative"
        pt={{
          content: () => 'pr-0 pb-0',
        }}
        blockScroll
        onMaximize={(e) => setIsMaximized(e.maximized)}
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end gap-2 z-50">
          <NavigationButton
            direction="prev"
            onClick={() => scrollToItem('prev')}
            disabled={currentIndex === 0}
            currentIndex={currentIndex}
            total={icd10.progress_note.length}
          />
          <NavigationButton
            direction="next"
            onClick={() => scrollToItem('next')}
            disabled={currentIndex === icd10.progress_note.length - 1}
          />
        </div>

        <div
          ref={scrollContainerRef}
          className={clsx(
            'flex py-3 pl-6 pr-16 flex-col',
            !isMaximized && 'max-h-[70vh] overflow-y-auto'
          )}
        >
          <div className="flex flex-col gap-3 border-b border-stroke dark:border-strokedark last:border-b-0">
            <div>
              <h3 className="font-bold text-md">Explanation and Evidence:</h3>
              <EvidenceContent 
                icd10={icd10}
                currentIndex={currentIndex}
                itemRefs={itemRefs}
                patientInfo={patientInfo}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default memo(EvidenceModal);