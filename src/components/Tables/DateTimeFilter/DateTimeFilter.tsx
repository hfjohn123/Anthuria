import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';

export default function DateTimeFilter({
  value,
  setValue,
  close,
  minDate,
  maxDate,
}: {
  value?: Date[];
  setValue: (value: [Date, Date | null]) => void;
  close?: () => void;
  minDate?: Date;
  maxDate?: Date;
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
            setValue([new Date(Date.now() - 1000 * 60 * 60 * 24), new Date()]);
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
            setValue([new Date(Date.now() - 1000 * 60 * 60 * 72), new Date()]);
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
            setValue([
              new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
              new Date(),
            ]);
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
        value={value}
        onChange={(e) => {
          setValue(e.value as [Date, Date | null]);
        }}
        minDate={minDate}
        maxDate={maxDate}
        inline
      />
    </div>
  );
}
