import useColorMode from '../../hooks/useColorMode.tsx';

const Loader = () => {
  useColorMode();
  return (
    <div className="fixed flex h-screen w-screen top-0 left-0 items-center justify-center bg-white dark:bg-boxdark-2 z-999999">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-700 border-t-transparent"></div>
    </div>
  );
};

export default Loader;
