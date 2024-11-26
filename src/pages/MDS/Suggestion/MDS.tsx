import DefaultLayout from '../../../layout/DefaultLayout.tsx';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import Loader from '../../../common/Loader';
import 'react-datepicker/dist/react-datepicker.css';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import MDSTable from './MDSTable.tsx';

export default function MDS() {
  const { route } = useContext(AuthContext);

  const { isPending, data, error, isError } = useQuery({
    queryKey: ['/mds/view_pdpm_final_result_test', route],
    queryFn: () =>
      axios
        .get(`${route}/mds/view_pdpm_final_result_test`)
        .then((res) => res.data),
  });

  if (isPending) {
    return <Loader />;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    data && (
      <DefaultLayout title={'Minimum Data Set'}>
        <div className="flex flex-col gap-7 my-3 sm:my-6 max-w-screen-3xl sm:px-9 mx-auto ">
          <MDSTable data={data} />
        </div>
      </DefaultLayout>
    )
  );
}
