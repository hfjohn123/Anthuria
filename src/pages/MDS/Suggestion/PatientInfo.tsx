import HyperLink from '../../../components/Basic/HyerLink.tsx';
import { MDSFinal } from '../../../types/MDSFinal.ts';
import { Row } from '@tanstack/react-table';

export default function PatientInfo({ row }: { row: Row<MDSFinal> }) {
  return (
    <div className="flex flex-col gap-5 px-3">
      <h3 className="text-base font-semibold underline">Patient Information</h3>
      <div className="flex flex-wrap">
        <div className="basis-1/2 border-r border-stroke pr-10 ">
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
            <span className="font-bold">
              Existing ICD-10 Code Related to NTA:{' '}
            </span>
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
      </div>
    </div>
  );
}
