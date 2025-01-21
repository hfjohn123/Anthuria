import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';

export default function DateTimeFilter({
  value,
  setValue,
  close,
  minDate,
  maxDate,
}: {
  value?: [number | null, number | null];
  setValue: (value: [number | null, number | null]) => void;
  close?: () => void;
  minDate?: number;
  maxDate?: number;
}) {
  return (
    <div
      className="flex flex-col gap-2"
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      <div className="flex gap-2 min-w-max items-center justify-center">
        <Button
          onClick={() => {
            setValue([
              new Date().getTime() - 1000 * 60 * 60 * 24,
              new Date().getTime(),
            ]);
            close?.();
          }}
          size="small"
          className="p-2 text-xs"
          outlined
        >
          Last 24h
        </Button>
        <Button
          onClick={() => {
            setValue([Date.now() - 1000 * 60 * 60 * 72, Date.now()]);
            close?.();
          }}
          size="small"
          className="p-2 text-xs"
          outlined
        >
          Last 3 days
        </Button>
        <Button
          onClick={() => {
            setValue([Date.now() - 1000 * 60 * 60 * 24 * 7, Date.now()]);
            close?.();
          }}
          size="small"
          className="p-2 text-xs	"
          outlined
        >
          Last week
        </Button>
      </div>
      <Calendar
        selectionMode="range"
        selectOtherMonths
        value={
          value && value[0]
            ? [
                value[0] ? new Date(value[0]) : null,
                value[1] ? new Date(value[1]) : null,
              ]
            : undefined
        }
        onChange={(e) => {
          e.value &&
            setValue([
              e.value[0] ? e.value[0].getTime() : null,
              e.value[1] ? e.value[1].getTime() : null,
            ]);
        }}
        minDate={minDate ? new Date(minDate) : undefined}
        maxDate={maxDate ? new Date(maxDate) : undefined}
        inline
      />
    </div>
  );
}
