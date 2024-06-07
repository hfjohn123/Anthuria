import NoSidebar from '../layout/NoSideBar';
import { AppTile } from '../components/Cards/AppTile';
import axios from 'axios';
import { useContext } from 'react';
import { createToast } from '../hooks/fireToast';
import { useQuery } from '@tanstack/react-query';
import Loader from '../common/Loader';
import { AuthContext } from '../components/AuthWrapper';
export default function Home() {
  const recent = JSON.parse(localStorage.getItem('recent') || '[]');
  const { user_applications_locations, route } = useContext(AuthContext);
  const {
    data: stars,
    isPending,
    error,
    isError,
  } = useQuery({
    queryKey: ['user_stars', route],
    queryFn: () => axios.get(`${route}/user_stars`).then((res) => res.data),
  });
  if (isPending) {
    return <Loader />;
  }
  if (isError) {
    createToast('Error', error.message, 3, error.message);
  }

  return (
    <NoSidebar>
      <div className="flex flex-col gap-5">
        {stars && stars.length > 0 && (
          <div>
            <p>Starred Applications</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 xl:grid-cols-8 2xl:gap-7.5">
              {user_applications_locations.map(
                (application) =>
                  stars.includes(application['id']) && (
                    <AppTile
                      key={application['id']}
                      title={application['display_name']}
                      stars={stars}
                      link={application['uri']}
                      icon={application['icon']}
                      id={application['id']}
                    />
                  ),
              )}
            </div>
          </div>
        )}
        {recent.length > 0 && (
          <div>
            <p>Recent Applications</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 xl:grid-cols-8 2xl:gap-7.5">
              {user_applications_locations.map(
                (application) =>
                  recent.includes(application['id']) && (
                    <AppTile
                      key={application['id']}
                      title={application['display_name']}
                      stars={stars}
                      link={application['uri']}
                      icon={application['icon']}
                      id={application['id']}
                    />
                  ),
              )}
            </div>
          </div>
        )}
        <div>
          <p>All Applications</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 xl:grid-cols-8 2xl:gap-7.5">
            {user_applications_locations.map((application) => (
              <AppTile
                key={application['id']}
                title={application['display_name']}
                stars={stars}
                link={application['uri']}
                icon={application['icon']}
                id={application['id']}
              />
            ))}
          </div>
        </div>
      </div>
    </NoSidebar>
  );
}
