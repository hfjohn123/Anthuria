import { useContext } from 'react';
import { AuthContext } from './AuthWrapper.tsx';

const PageTitle: React.FC<{
  id?: string;
  recenctable?: boolean;
  title?: string;
}> = ({
  id,
  recenctable = true,
  title,
}: {
  id?: string;
  title?: string;
  recenctable?: boolean;
}) => {
  const { user_applications_locations } = useContext(AuthContext);
  if (!id && title) {
    document.title = title;
    return null;
  }
  if (localStorage.getItem('clearRecent') !== '1') {
    localStorage.removeItem('recent');
    localStorage.setItem('clearRecent', '1');
  }
  const recent = JSON.parse(localStorage.getItem('recent') || '[]');
  const foundApplication:
    | (typeof user_applications_locations)[number]
    | undefined = user_applications_locations.find(
    (application: (typeof user_applications_locations)[number]): boolean =>
      application['id'] === id,
  );
  if (foundApplication) {
    document.title = foundApplication['display_name'];
    if (recenctable) {
      const new_recent = [...new Set([id, ...recent])].slice(0, 4);
      localStorage.setItem('recent', JSON.stringify(new_recent));
    }
  }

  return null;
};

export default PageTitle;
