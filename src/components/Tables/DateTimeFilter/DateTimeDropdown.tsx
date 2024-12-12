import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import SelectCaretDown from '../../../images/icon/SelectCaretDown.tsx';
import clsx from 'clsx';
import DateTimeFilter from './DateTimeFilter.tsx';

export default function DateTimeDropdown({
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
            <span className="">
              {id}
              {value && ': ' + value?.map((d) => d?.toDateString()).join(' - ')}
            </span>
            {value && value.filter((d) => d).length > 0 ? (
              <div
                onClick={() => clearFilter()}
                className="fill-[rgb(204,204,204)]"
              >
                <svg
                  height="20"
                  width="20"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                </svg>
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
                console.log('test');
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
