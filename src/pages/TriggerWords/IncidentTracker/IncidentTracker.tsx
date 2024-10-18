import DefaultLayout from '../../../layout/DefaultLayout.tsx';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useState } from 'react';
import Loader from '../../../common/Loader';
import 'react-datepicker/dist/react-datepicker.css';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import IncidentTrackerTable from './IncidentTrackerTable.tsx';
export default function IncidentTracker() {
  const { route } = useContext(AuthContext);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(
      () => {
        setNow(new Date());
      },
      1000 * 60 * 5,
    );
    return () => clearInterval(interval);
  }, []);
  const { isPending, data, error, isError } = useQuery({
    queryKey: ['trigger_word_view_incident_detail_final', route],
    queryFn: () =>
      axios
        .get(`${route}/trigger_word_view_incident_detail_final`)
        .then((res) => res.data),
  });
  if (localStorage.getItem('IncidentTrackerClearStorage') !== '1') {
    localStorage.removeItem('incidentTackerUserVisibilitySettings');
    localStorage.setItem('IncidentTrackerClearStorage', '1');
  }

  if (isPending) {
    return <Loader />;
  }
  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <DefaultLayout title={'Clinical Pulse'}>
      <div className="flex flex-col gap-7 mt-3 sm:mt-0">
        <h1 className="text-2xl font-bold ">Open Incident</h1>
        <IncidentTrackerTable data={data} now={now} />
      </div>
    </DefaultLayout>
  );
}
