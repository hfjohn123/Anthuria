import { Fragment, useState } from 'react';
import { Row } from '@tanstack/react-table';
import { EventFinal } from '../../../types/EventFinal.ts';
import { Button } from '@headlessui/react';
import HyperLink from '../../../components/Basic/HyerLink.tsx';
import ShowMoreText from 'react-show-more-text';
export default function ProgressNote({ row }: { row: Row<EventFinal> }) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="flex flex-col gap-3 py-4 px-3">
      <h3 className="text-base font-semibold underline">Progress Notes</h3>
      {row.original.progress_notes && row.original.progress_notes.length > 0 ? (
        <table className="w-full border-b-[1.5px] border-stroke dark:border-strokedark border-separate border-spacing-y-3">
          <thead>
            <tr className="border-[1.5px] border-stroke dark:border-strokedark text-body-2">
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
                key={
                  row.original.event_id.toString() +
                  s.progress_note_id.toString()
                }
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
                  <td className="pr-10">
                    <span className="px-2 py-0.5 bg-opacity-15 rounded-md bg-[#807F7F] text-nowrap">
                      {s.category}
                    </span>
                  </td>
                  <td className="pr-10 ">
                    <ShowMoreText
                      anchorClass="text-primary cursor-pointer block dark:text-secondary "
                      className="whitespace-pre-line"
                      lines={4}
                    >
                      {s.note}
                    </ShowMoreText>
                  </td>
                  <td className="pr-10">{s.created_by}</td>
                  <td className="">
                    <HyperLink
                      href={`https://clearviewhcm.matrixcare.com/core/selectResident.action?residentID=${row.original.patient_id}&referringPage=/progressNoteView.action?progressNoteID=${s.progress_note_id}`}
                      tooltip_content={'Click to view Progress Note'}
                    >
                      Note
                    </HyperLink>
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No Progress Notes</p>
      )}
      {row.original.progress_notes &&
        row.original.progress_notes.length > 1 && (
          <Button
            className="text-primary mt-3 self-start"
            onClick={() => setOpen((prevState) => !prevState)}
          >
            {open ? 'View Less' : 'View All'}
          </Button>
        )}
    </div>
  );
}
