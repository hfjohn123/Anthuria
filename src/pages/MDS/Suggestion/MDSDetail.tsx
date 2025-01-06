import { PDPMPatient } from '../../../types/MDSFinal.ts';
import { Row } from '@tanstack/react-table';
import MDSSuggestion from './MDSSuggestion.tsx';
import PatientInfo from './PatientInfo.tsx';
import { useContext } from 'react';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from 'primereact/skeleton';

export default function MDSDetail({ row }: { row: Row<PDPMPatient> }) {
  const { route } = useContext(AuthContext);

  const { isPending, data, error, isError } = useQuery({
    queryKey: [
      '/mds/view_pdpm_final_result_test',
      route,
      row.original.internal_patient_id,
    ],
    queryFn: () =>
      axios
        .get(`${route}/mds/view_pdpm_final_result_test`, {
          params: {
            internal_patient_id: row.original.internal_patient_id,
          },
        })
        .then((res) => res.data),
  });

  if (isPending) {
    return (
      <div className="border-round border-1 surface-border p-4">
        <ul className="m-0 p-0 list-none">
          <li className="mb-3">
            <div className="flex">
              <Skeleton shape="circle" size="4rem" className="mr-2"></Skeleton>
              <div style={{ flex: '1' }}>
                <Skeleton width="100%" className="mb-2"></Skeleton>
                <Skeleton width="75%"></Skeleton>
              </div>
            </div>
          </li>
          <li className="mb-3">
            <div className="flex">
              <Skeleton shape="circle" size="4rem" className="mr-2"></Skeleton>
              <div style={{ flex: '1' }}>
                <Skeleton width="100%" className="mb-2"></Skeleton>
                <Skeleton width="75%"></Skeleton>
              </div>
            </div>
          </li>
          <li className="mb-3">
            <div className="flex">
              <Skeleton shape="circle" size="4rem" className="mr-2"></Skeleton>
              <div style={{ flex: '1' }}>
                <Skeleton width="100%" className="mb-2"></Skeleton>
                <Skeleton width="75%"></Skeleton>
              </div>
            </div>
          </li>
          <li>
            <div className="flex">
              <Skeleton shape="circle" size="4rem" className="mr-2"></Skeleton>
              <div style={{ flex: '1' }}>
                <Skeleton width="100%" className="mb-2"></Skeleton>
                <Skeleton width="75%"></Skeleton>
              </div>
            </div>
          </li>
        </ul>
      </div>
    );
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 px-3 text-sm py-4 flex flex-col gap-5">
      <PatientInfo row={row} />
      <MDSSuggestion row={data} />
    </div>
  );
}
