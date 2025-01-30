import React, { ReactNode } from 'react';

const NoBar: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default NoBar;
