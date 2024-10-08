import ShowMoreText from 'react-show-more-text';
import HyperLink from '../../components/Basic/HyerLink.tsx';
import { Bot } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { ThumbsDown, ThumbsUp } from '@phosphor-icons/react';
import Modal from '../../components/Modal/Modal.tsx';
import CommentForm from '../../components/Forms/CommentForm.tsx';
import { MDSFinal } from '../../types/MDSFinal.ts';
import { Row } from '@tanstack/react-table';
import MDSSuggestion from './MDSSuggestion.tsx';

export default function MDSDetail({ row }: { row: Row<MDSFinal> }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 px-4 text-sm py-4 flex flex-wrap">
      <div className="basis-1/2 border-r border-stroke pr-10">
        <div>
          <span className="font-bold">Patient Name:</span>
          {row.original.upstream === 'MTX' ? (
            <HyperLink
              tooltip_content="View Patient in MaxtrixCare"
              href={`https://clearviewhcm.matrixcare.com/core/selectResident.action?residentID=${row.original.patient_id}`}
            >
              {row.getValue('patient_name')}
            </HyperLink>
          ) : row.original.upstream === 'PCC' ? (
            <HyperLink
              tooltip_content="View Patient in PCC"
              href={`https://www19.pointclickcare.com/admin/client/clientlist.jsp?ESOLtabtype=C&ESOLglobalclientsearch=Y&ESOLclientid=${row.original.patient_id}&ESOLfacid=${row.original.internal_facility_id.split('_').pop()}&ESOLsave=P`}
            >
              {row.getValue('patient_name')}
            </HyperLink>
          ) : (
            <p>{row.getValue('patient_name')}</p>
          )}
        </div>
        <div className="mt-2.5">
          <span className="font-bold">Patient ID: </span>
          <p>{row.original.patient_id}</p>
        </div>
        <div className="mt-2.5">
          <span className="font-bold">Facility Name:</span>
          <p>{row.getValue('facility_name')}</p>
        </div>
      </div>
      <div className="basis-1/2 pl-10">
        <div className="">
          <span className="font-bold">Existing ICD-10 Code: </span>
          {row.getValue<string[]>('existing_icd10').length === 0 ? (
            <p>No ICD-10 Codes</p>
          ) : (
            <p>{row.getValue<string[]>('existing_icd10').join(', ')}</p>
          )}
        </div>
        <div className="mt-2.5">
          <span className="font-bold">Last Updated:</span>
          <p>
            {new Date(row.getValue('update_time')).toLocaleDateString()}{' '}
            {new Date(row.getValue('update_time')).toLocaleTimeString(
              navigator.language,
              {
                hour: '2-digit',
                minute: '2-digit',
              },
            )}
          </p>
        </div>
      </div>
      <MDSSuggestion icd10={row.original.new_icd10} />
    </div>
  );
}
