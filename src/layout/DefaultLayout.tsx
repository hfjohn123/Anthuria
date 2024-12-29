import { useState, ReactNode } from 'react';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';

const DefaultLayout = ({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* <!-- ===== Content Area Start ===== --> */}
      <div className="relative flex flex-auto flex-col h-screen max-w-[100vw] overflow-clip lg:ml-13 dark:bg-boxdark-2 dark:text-bodydark  ">
        {/* <!-- ===== Header Start ===== --> */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          title={title}
        />
        {/* <!-- ===== Header End ===== --> */}

        {/* <!-- ===== Main Content Start ===== --> */}
        <main className="flex-grow  overflow-y-auto overflow-x-clip">
          {children}
        </main>
        {/* <!-- ===== Main Content End ===== --> */}
      </div>
      {/* <!-- ===== Content Area End ===== --> */}
    </>
  );
};

export default DefaultLayout;
