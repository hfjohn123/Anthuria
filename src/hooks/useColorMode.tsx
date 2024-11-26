import { useContext, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { PrimeReactContext } from 'primereact/api';

const useColorMode = () => {
  const [colorMode, setColorMode] = useLocalStorage('color-theme', 'light');
  const { changeTheme } = useContext(PrimeReactContext);

  useEffect(() => {
    const className = 'dark';
    const bodyClass = window.document.body.classList;
    window.dispatchEvent(new Event('storage'));

    colorMode === 'dark'
      ? bodyClass.add(className)
      : bodyClass.remove(className);

    changeTheme?.(
      colorMode === 'dark' ? 'lara-light-blue' : 'lara-dark-blue',
      colorMode === 'dark' ? 'lara-dark-blue' : 'lara-light-blue',
      'theme-link',
    );
  }, [colorMode]);

  return [colorMode, setColorMode];
};

export default useColorMode;
