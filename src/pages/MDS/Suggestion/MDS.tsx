import DefaultLayout from '../../../layout/DefaultLayout.tsx';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import Loader from '../../../common/Loader';
import 'react-datepicker/dist/react-datepicker.css';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import MDSTable from './MDSTable.tsx';
import { PDPMPatient } from '../../../types/MDSFinal.ts';

export default function MDS() {
  const { route } = useContext(AuthContext);
  const [stableData, setStableData] = useState<PDPMPatient[] | null>(null);

  const {
    isPending,
    data,
    error,
    isError,
  }: {
    isPending: boolean;
    data: PDPMPatient[] | undefined;
    error: any;
    isError: boolean;
  } = useQuery({
    queryKey: ['/mds/view_pdpm_mds_patient_list', route],
    queryFn: ({ signal }) =>
      axios
        .get(`${route}/mds/view_pdpm_mds_patient_list`, { signal })
        .then((res) => res.data),
  });
  useEffect(() => {
    if (data) {
      setStableData((prevState) => {
        return data.map((item) => {
          const prevItem =
            prevState &&
            prevState.find(
              (prev) =>
                prev.internal_patient_id === item.internal_patient_id &&
                prev.internal_facility_id === item.internal_facility_id,
            );
          return prevItem
            ? { ...prevItem, ...item }
            : {
                ...item,
                original_nta_opportunities:
                  item.suggest_nta_pay - item.mds_nta_pay,
                original_slp_opportunities:
                  item.suggest_slp_pay - item.mds_slp_pay,
                original_pt_opportunities:
                  item.suggest_pt_pay - item.mds_pt_pay,
                original_ot_opportunities:
                  item.suggest_ot_pay - item.mds_ot_pay,
                original_nursing_opportunities:
                  item.suggest_nursing_pay - item.mds_nursing_pay,
                original_total_opportunities:
                  item.suggest_nta_pay +
                  item.suggest_slp_pay +
                  item.suggest_pt_pay +
                  item.suggest_ot_pay +
                  item.suggest_nursing_pay -
                  item.mds_nta_pay -
                  item.mds_slp_pay -
                  item.mds_pt_pay -
                  item.mds_ot_pay -
                  item.mds_nursing_pay,
              };
        });
      });
    }
  }, [data]);

  if (isPending) {
    return <Loader />;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    stableData && (
      <DefaultLayout title={'Minimum Data Set'}>
        <div className="flex flex-col gap-5 my-3 sm:my-5 max-w-screen-3xl sm:px-5 mx-auto ">
          <MDSTable data={stableData} />
        </div>
      </DefaultLayout>
    )
  );
}
