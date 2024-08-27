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
      <table className="w-full mt-3">
        <thead>
          <tr className="border-b border-stroke dark:border-strokedark">
            <th className="text-left w-2/12">Date</th>
            <th className="text-left w-1/12">Category</th>
            <th className="text-left w-5/12">Note</th>
            <th className="text-left w-2/12">Auther</th>
            <th className="text-left w-2/12">Link</th>
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
                }`}
              >
                <td className="align-top">
                  {new Date(s.created_date)
                    .toLocaleString(navigator.language, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                    .replace(/,/g, ' ')}
                </td>
                <td className="align-top">{s.category}</td>
                <td className="align-top">
                  <ShowMoreText anchorClass="text-primary cursor-pointer block dark:text-secondary ">
                    {s.note}
                  </ShowMoreText>
                </td>
                <td className="align-top">{s.created_by}</td>
                <td className="align-top">Placeholder</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      <Button
        className="text-primary"
        onClick={() => setOpen((prevState) => !prevState)}
      >
        {open ? 'View Less' : 'View All'}
      </Button>
    </div>
  );
}
