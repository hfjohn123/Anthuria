const NHQITable = ({ data }) => {
  if (!data) {
    return null;
  }
  const headers = Object.keys(data[0]);
  return (
    <div className="xl:col-span-8 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark overflow-y-scroll max-h-[80vh]">
      <div className="py-6 px-4 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          How Others Do In My County
        </h4>
      </div>

      <div className="grid grid-cols-6 border-t bg-gray-2 border-stroke py-4.5 px-4 dark:bg-boxdark dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5 sticky top-0 ">
        <div className="col-span-1 hidden sm:flex">
          <p className="font-medium">ID</p>
        </div>
        <div className="col-span-2 sm:col-span-3 flex items-center">
          <p className="font-medium">Name</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Score</p>
        </div>
        <div className=" col-span-1 flex items-center">
          <p className="font-medium">City</p>
        </div>
        <div className=" col-span-1 hidden items-center sm:flex">
          <p className="font-medium">County</p>
        </div>
        <div className=" col-span-1 flex items-center ">
          <p className="font-medium">Region</p>
        </div>
      </div>
      {/* ${
              d['Facility Name'] === location && 'bg-secondary dark:bg-primary'
            }  */}
      {data.map((d) => (
        <>
          <div
            className={`grid grid-cols-5 border-t border-stroke py-4.5 px-4  dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5 `}
            key={d['Facility ID']}
          >
            <div className="col-span-1 hidden sm:flex items-center">
              <p className="text-sm text-black dark:text-white ">
                {d['Facility ID']}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-3  items-center">
              <p className="text-sm text-black dark:text-white">
                {d['Facility Name']}
              </p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="text-sm text-black dark:text-white">
                {d['Numeric Value']}
              </p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="text-sm text-black dark:text-white">{d.City}</p>
            </div>
            <div className="col-span-1 items-center hidden sm:flex">
              <p className="text-sm text-black dark:text-white">{d.County}</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="text-sm text-black dark:text-white">{d.Region}</p>
            </div>
          </div>
        </>
      ))}
    </div>
  );
};

export default NHQITable;
