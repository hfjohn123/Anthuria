import { useContext, useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import { AuthContext } from './AuthWrapper.tsx';

const PageTitle: React.FC<{ title: string; recenctable?: boolean }> = ({
  title,
  recenctable = false,
}: {
  title: string;
  recenctable?: boolean;
}) => {
  const location = useLocation();
  const { user_applications_locations } = useContext(AuthContext);
  useEffect(() => {
    document.title = title;
    if (recenctable) {
      const recent = JSON.parse(localStorage.getItem('recent') || '[]');
      const foundApplication = user_applications_locations.find(
        (application) => application['uri'] === location.pathname,
      );
      const id = foundApplication ? foundApplication['id'] : null;
      if (id) {
        const new_recent = [...new Set([id, ...recent])].slice(0, 4);
        localStorage.setItem('recent', JSON.stringify(new_recent));
      }
    }
  }, [location]);

  return null;
};

export default PageTitle;
