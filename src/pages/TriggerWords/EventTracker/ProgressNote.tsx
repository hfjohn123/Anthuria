import { Fragment, useState } from 'react';
import ShowMoreText from 'react-show-more-text';
import { Row } from '@tanstack/react-table';
import { EventFinal } from '../../../types/EventFinal.ts';
import { Button } from '@headlessui/react';

export default function ProgressNote({ row }: { row: Row<EventFinal> }) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div>
      <h3 className="text-base font-semibold underline">Progress Notes</h3>
      <table className="w-full mt-3 border-b-[1.5px] border-stroke dark:border-strokedark border-separate border-spacing-y-3">
        <thead>
          <tr className="border-[1.5px] border-stroke dark:border-strokedark">
            <th className="text-left w-1/12 pb-1 border-b-[1.5px] border-stroke dark:border-strokedark pr-10">
              Date
            </th>
            <th className="text-left w-1/12 pb-1 border-b-[1.5px] border-stroke dark:border-strokedark pr-10">
              Category
            </th>
            <th className="text-left w-6/12 pb-1 border-b-[1.5px] border-stroke dark:border-strokedark pr-10">
              Note
            </th>
            <th className="text-left w-2/12 pb-1 border-b-[1.5px] border-stroke dark:border-strokedark pr-10">
              Auther
            </th>
            <th className="text-left w-2/12 pb-1 border-b-[1.5px] border-stroke dark:border-strokedark pr-10">
              Link
            </th>
          </tr>
        </thead>
        <tbody>
          {row.original.progress_notes.map((s) => (
            <Fragment
              key={row.getValue('event_id') + s.created_date.toLocaleString()}
            >
              <tr
                className={`${
                  row.original.progress_notes.indexOf(s) === 0 || open
                    ? ''
                    : 'hidden'
                } `}
              >
                <td className="whitespace-pre-line pr-10">
                  {new Date(s.created_date)
                    .toLocaleString(navigator.language, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                    .replace(/,/g, '\n')}
                </td>
                <td className="pr-10">{s.category}</td>
                <td className="pr-10">
                  <ShowMoreText anchorClass="text-primary cursor-pointer block dark:text-secondary ">
                    {s.note}
                  </ShowMoreText>
                </td>
                <td className="pr-10">{s.created_by}</td>
                <td className="">Placeholder</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      {row.original.progress_notes.length > 1 && (
        <Button
          className="text-primary mt-3"
          onClick={() => setOpen((prevState) => !prevState)}
        >
          {open ? 'View Less' : 'View All'}
        </Button>
      )}
    </div>
  );
}
