import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import SelectCaretDown from '../../../images/icon/SelectCaretDown.tsx';
import clsx from 'clsx';
import DateTimeFilter from './DateTimeFilter.tsx';
import { Funnel } from '@phosphor-icons/react';

export default function DateTimeFunnelDropdown({
  id,
  value,
  autoFocus = true,
  setValue,
  clearFilter,
  minDate,
  maxDate,
  callback,
}: {
  id: string;
  autoFocus?: boolean;
  value?: Date[];
  setValue: (value: [Date, Date | null]) => void;
  clearFilter: () => void;
  minDate?: Date;
  maxDate?: Date;
  callback?: () => void;
}) {
  return (
    <Popover>
      {({ open, close }) => (
        <>
          <PopoverButton
            ref={(e) => {
              if (autoFocus) e?.click();
            }}
            className={clsx(
              'text-sm data-[open]:!shadow-filter data-[open]:!shadow-blue-500 flex flex-nowrap items-center gap-1 px-2 py-0.5 rounded-lg border border-stroke outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary',
              value && value.length > 0 && 'border-body',
            )}
          >
            {value && value.filter((d) => d).length > 0 ? (
              <div
                onClick={() => clearFilter()}
                className="fill-[rgb(204,204,204)]"
              >
                <Funnel className="inline size-5 opacity-70" />
              </div>
            ) : (
              <SelectCaretDown className="fill-[rgb(204,204,204)] hover:fill-[rgb(153,153,153)] data-[open]:fill-[rgb(153,153,153)]" />
            )}
          </PopoverButton>
          <Transition
            show={open}
            afterLeave={() => {
              // Your onClose handler here
              if (!value || (value && value.filter((d) => d).length < 2)) {
                clearFilter();
                return;
              }
              callback?.();
            }}
          >
            <PopoverPanel
              transition
              anchor={{ to: 'bottom start', gap: 10 }}
              className="origin-top-right p-2 bg-white dark:bg-form-input rounded-md min-w-max max-w-max border shadow border-stroke transition duration-100 ease-out [--anchor-gap:var(--spacing-3)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 z-999"
            >
              <DateTimeFilter
                setValue={setValue}
                close={close}
                value={value}
                maxDate={maxDate}
                minDate={minDate}
              />
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
