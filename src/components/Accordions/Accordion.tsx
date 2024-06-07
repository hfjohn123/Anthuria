import { useState, useCallback } from 'react';
import ReactStars from 'react-stars';
import * as d3 from 'd3';
import arrow_right from '../../images/icon/arrow-right-circle.svg';
import arrow_down from '../../images/icon/arrow-down-circle.svg';
const category = {
  qualityOfCare: [
    'Percent of long stay high risk residents with pressure ulcers',
    'Percent of long stay low risk residents who lose control of their bowel or bladder',
    'Percent of long stay residents with a urinary tract infection',
  ],
  preventiveCare: [
    'Percent of long stay residents who received the seasonal influenza vaccine',
    'Percent of long stay residents who received the pneumococcal vaccine',
  ],
};

export default function Accordion({
  data,
  options,
}: {
  data: any;
  options: string[];
}) {
  if (!data) {
    return null;
  }
  const [open, setOpen] = useState(0);
  const [subOpen, setSubOpen] = useState(0);
  const { myYearData, lastYearBestCenterData } = data;
  const { qualityOfCare, preventiveCare } = category;
  myYearData.sort((a: any, b: any) => {
    if (
      options.indexOf(a['Measure Full Name']) <
      options.indexOf(b['Measure Full Name'])
    ) {
      return -1;
    } else if (
      options.indexOf(a['Measure Full Name']) >
      options.indexOf(b['Measure Full Name'])
    ) {
      return 1;
    }
    return 0;
  });
  const myYearQualityOfCare = myYearData.filter(
    (d) => qualityOfCare.indexOf(d['Measure Full Name']) !== -1,
  );
  const myYearPreventiveCare = myYearData.filter(
    (d) => preventiveCare.indexOf(d['Measure Full Name']) !== -1,
  );
  lastYearBestCenterData.sort((a: any, b: any) => {
    if (
      options.indexOf(a['Measure Full Name']) <
      options.indexOf(b['Measure Full Name'])
    ) {
      return -1;
    } else if (
      options.indexOf(a['Measure Full Name']) >
      options.indexOf(b['Measure Full Name'])
    ) {
      return 1;
    }
    return 0;
  });
  const lastYearQualityOfCare = lastYearBestCenterData.filter(
    (d) => qualityOfCare.indexOf(d['Measure Full Name']) !== -1,
  );
  const lastYearPreventiveCare = lastYearBestCenterData.filter(
    (d) => preventiveCare.indexOf(d['Measure Full Name']) !== -1,
  );
  function handleClick(e: any) {
    const target = e.target.getAttribute('name');
    setOpen((prev) => {
      if (prev === 1 && target === '1') {
        return 0;
      } else if (prev === 2 && target === '2') {
        return 0;
      }
      setSubOpen(0);
      return +target;
    });
  }
  function handleSubClick(e: any) {
    const target = e.target.getAttribute('name');
    setSubOpen((prev) => {
      if (prev === 1 && target === 'sub_1') {
        return 0;
      } else if (prev === 2 && target === 'sub_2') {
        return 0;
      }
      return +target.split('_')[1];
    });
  }

  return (
    <div className="basis-1/2 xl:basis-0 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Facility Information
        </h4>
      </div>
      <div className="flex flex-col">
        <div
          className={`border basis-1/2 border-stroke shadow-9  dark:border-strokedark dark:shadow-none ${
            open === 1 ? 'bg-slate-100 dark:bg-slate-900' : ''
          } `}
        >
          <button
            name="1"
            className=" w-full px-4 md:px-6 xl:px-7.5 py-2 "
            onClick={handleClick}
          >
            <div className="flex items-center justify-between gap-2 pointer-events-none">
              <div>
                <h4 className="text-left text-title-xsm text-black dark:text-white">
                  This Facility
                </h4>
              </div>
              <div className="flex h-9 w-full max-w-9 items-center justify-center rounded-full border border-primary dark:border-white">
                {open !== 1 ? (
                  <svg
                    className="fill-primary duration-200 ease-in-out dark:fill-white "
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.2969 6.51563H8.48438V1.70312C8.48438 1.15625 8.04688 0.773438 7.5 0.773438C6.95313 0.773438 6.57031 1.21094 6.57031 1.75781V6.57031H1.75781C1.21094 6.57031 0.828125 7.00781 0.828125 7.55469C0.828125 8.10156 1.26563 8.48438 1.8125 8.48438H6.625V13.2969C6.625 13.8438 7.0625 14.2266 7.60938 14.2266C8.15625 14.2266 8.53906 13.7891 8.53906 13.2422V8.42969H13.3516C13.8984 8.42969 14.2813 7.99219 14.2813 7.44531C14.2266 6.95312 13.7891 6.51563 13.2969 6.51563Z"
                      fill=""
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="fill-primary duration-200 ease-in-out dark:fill-white"
                    width="15"
                    height="3"
                    viewBox="0 0 15 3"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.503 0.447144C13.446 0.447144 13.503 0.447144 13.503 0.447144H1.49482C0.925718 0.447144 0.527344 0.902427 0.527344 1.47153C0.527344 2.04064 0.982629 2.43901 1.55173 2.43901H13.5599C14.129 2.43901 14.5273 1.98373 14.5273 1.41462C14.4704 0.902427 14.0151 0.447144 13.503 0.447144Z"
                      fill=""
                    ></path>
                  </svg>
                )}
              </div>
            </div>
          </button>
          <div
            className={`transition-all duration-200 ease-in-out  px-4 md:px-6 xl:px-7.5 py-2 ${
              open !== 1 ? `hidden` : `block`
            }`}
          >
            <h4 className="font-bold">{myYearData[0]['Facility Name']}</h4>
            {/* <p>ID: {myYearData[0]['Facility ID']}</p> */}
            {/* <p>
              Address: {myYearData[0]['City']}, {myYearData[0]['County']}, NY
            </p> */}
            <h4 className="font-semibold mt-0.5">Stars:</h4>
            <div className="grid grid-cols-12 text-md">
              <span className="col-span-9">Overall: </span>
              <div className="flex gap-1 col-span-3 items-center justify-self-end">
                <ReactStars
                  value={d3.mean(myYearData, (d) => 6 - d['Quintile'])}
                  edit={false}
                />
              </div>
              <hr className="col-span-12 my-1" />
              <button
                name="sub_1"
                className="col-span-12"
                onClick={handleSubClick}
              >
                <div className="grid grid-cols-12 gap-1 items-center pointer-events-none">
                  {open === 1 && subOpen === 1 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v4.69L6.03 8.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06L8.75 9.44V4.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8A7 7 0 1 0 1 8a7 7 0 0 0 14 0ZM4.75 7.25a.75.75 0 0 0 0 1.5h4.69L8.22 9.97a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 0 0-1.06 1.06l1.22 1.22H4.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}

                  <span className="col-span-8 justify-self-start">
                    Quality of Care
                  </span>
                  <ReactStars
                    className="col-span-3 flex justify-self-end"
                    value={d3.mean(
                      myYearQualityOfCare,
                      (d) => 6 - d['Quintile'],
                    )}
                    edit={false}
                  />
                </div>
              </button>
              <div
                className={`col-span-12 ${
                  open === 1 && subOpen === 1 ? 'block' : 'hidden'
                }`}
              >
                {myYearQualityOfCare.map((d) => (
                  <div
                    key={d['Measure Full Name'] + d['Facility ID']}
                    className="grid grid-cols-12 col-span-12"
                  >
                    <span className="col-span-9 ">
                      {d['Measure Full Name']}:
                    </span>
                    <div className="flex gap-1 col-span-3 items-center justify-self-end">
                      <ReactStars value={6 - d['Quintile']} edit={false} />
                    </div>
                  </div>
                ))}
              </div>
              <hr className="col-span-12 my-1" />
              <button
                name="sub_2"
                className="col-span-12"
                onClick={handleSubClick}
              >
                <div className="grid grid-cols-12 gap-1 items-center pointer-events-none">
                  {open === 1 && subOpen === 2 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v4.69L6.03 8.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06L8.75 9.44V4.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8A7 7 0 1 0 1 8a7 7 0 0 0 14 0ZM4.75 7.25a.75.75 0 0 0 0 1.5h4.69L8.22 9.97a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 0 0-1.06 1.06l1.22 1.22H4.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="col-span-8 justify-self-start">
                    Preventive Care
                  </span>
                  <ReactStars
                    className="col-span-3 flex justify-self-end"
                    value={d3.mean(
                      myYearPreventiveCare,
                      (d) => 6 - d['Quintile'],
                    )}
                    edit={false}
                  />
                </div>
              </button>
              <div
                className={`col-span-12 ${
                  open === 1 && subOpen === 2 ? 'block' : 'hidden'
                }`}
              >
                {myYearPreventiveCare.map((d) => (
                  <div
                    key={d['Measure Full Name'] + d['Facility ID']}
                    className="grid grid-cols-12 col-span-12"
                  >
                    <span className="col-span-9 ">
                      {d['Measure Full Name']}:
                    </span>
                    <div className="flex gap-1 col-span-3 items-center justify-self-end">
                      <ReactStars value={6 - d['Quintile']} edit={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`border border-stroke  shadow-9  dark:border-strokedark dark:shadow-none basis-1/2  ${
            open === 2 ? 'bg-slate-100 dark:bg-slate-900' : ''
          } `}
        >
          <button
            name="2"
            className="w-full z-10 px-4 md:px-6 xl:px-7.5 py-2"
            onMouseUp={handleClick}
          >
            <div className="flex items-center justify-between gap-2 pointer-events-none">
              <div>
                <h4 className="text-left text-title-xsm text-black dark:text-white">
                  Benchmark Facility
                </h4>
              </div>
              <div className="flex h-9 w-full max-w-9 items-center justify-center rounded-full border border-primary dark:border-white">
                {open !== 2 ? (
                  <svg
                    className="fill-primary duration-200 ease-in-out dark:fill-white "
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.2969 6.51563H8.48438V1.70312C8.48438 1.15625 8.04688 0.773438 7.5 0.773438C6.95313 0.773438 6.57031 1.21094 6.57031 1.75781V6.57031H1.75781C1.21094 6.57031 0.828125 7.00781 0.828125 7.55469C0.828125 8.10156 1.26563 8.48438 1.8125 8.48438H6.625V13.2969C6.625 13.8438 7.0625 14.2266 7.60938 14.2266C8.15625 14.2266 8.53906 13.7891 8.53906 13.2422V8.42969H13.3516C13.8984 8.42969 14.2813 7.99219 14.2813 7.44531C14.2266 6.95312 13.7891 6.51563 13.2969 6.51563Z"
                      fill=""
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="fill-primary duration-200 ease-in-out dark:fill-white"
                    width="15"
                    height="3"
                    viewBox="0 0 15 3"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.503 0.447144C13.446 0.447144 13.503 0.447144 13.503 0.447144H1.49482C0.925718 0.447144 0.527344 0.902427 0.527344 1.47153C0.527344 2.04064 0.982629 2.43901 1.55173 2.43901H13.5599C14.129 2.43901 14.5273 1.98373 14.5273 1.41462C14.4704 0.902427 14.0151 0.447144 13.503 0.447144Z"
                      fill=""
                    ></path>
                  </svg>
                )}
              </div>
            </div>
          </button>
          <div
            className={`transition-all duration-200 px-4 md:px-6 xl:px-7.5 py-2 ease-in-out ${
              open !== 2 ? `hidden` : `block`
            }`}
          >
            <h4 className="font-bold">
              {lastYearBestCenterData[0]['Facility Name']}
            </h4>
            {/* <p>ID: {myYearData[0]['Facility ID']}</p> */}
            {/* <p>
              Address: {myYearData[0]['City']}, {myYearData[0]['County']}, NY
            </p> */}
            <h4 className="font-semibold mt-0.5">Stars:</h4>
            <div className="grid grid-cols-12 text-md">
              <span className="col-span-9">Overall: </span>
              <div className="flex gap-1 col-span-3 items-center justify-self-end">
                <ReactStars
                  value={d3.mean(
                    lastYearBestCenterData,
                    (d) => 6 - d['Quintile'],
                  )}
                  edit={false}
                />
              </div>
              <hr className="col-span-12 my-1" />

              <button
                name={'sub_1'}
                className="col-span-12"
                onClick={handleSubClick}
              >
                <div className="grid grid-cols-12 gap-1 items-center pointer-events-none">
                  {open === 2 && subOpen === 1 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v4.69L6.03 8.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06L8.75 9.44V4.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8A7 7 0 1 0 1 8a7 7 0 0 0 14 0ZM4.75 7.25a.75.75 0 0 0 0 1.5h4.69L8.22 9.97a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 0 0-1.06 1.06l1.22 1.22H4.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="col-span-8 justify-self-start">
                    Quality of Care
                  </span>
                  <ReactStars
                    className="col-span-3 flex justify-self-end"
                    value={d3.mean(
                      lastYearQualityOfCare,
                      (d) => 6 - d['Quintile'],
                    )}
                    edit={false}
                  />
                </div>
              </button>
              <div
                className={`col-span-12 ${
                  open === 2 && subOpen === 1 ? 'block' : 'hidden'
                }`}
              >
                {lastYearQualityOfCare.map((d) => (
                  <div
                    key={d['Measure Full Name'] + d['Facility ID']}
                    className="grid grid-cols-12 col-span-12"
                  >
                    <span className="col-span-9 ">
                      {d['Measure Full Name']}:
                    </span>
                    <div className="flex gap-1 col-span-3 items-center justify-self-end">
                      <ReactStars value={6 - d['Quintile']} edit={false} />
                    </div>
                  </div>
                ))}
              </div>
              <hr className="col-span-12 my-1" />
              <button
                name={'sub_2'}
                className="col-span-12"
                onClick={handleSubClick}
              >
                <div className="grid grid-cols-12 gap-1 items-center pointer-events-none">
                  {open === 2 && subOpen === 2 ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v4.69L6.03 8.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l2.5-2.5a.75.75 0 1 0-1.06-1.06L8.75 9.44V4.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8A7 7 0 1 0 1 8a7 7 0 0 0 14 0ZM4.75 7.25a.75.75 0 0 0 0 1.5h4.69L8.22 9.97a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 0 0-1.06 1.06l1.22 1.22H4.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="col-span-8 justify-self-start">
                    Preventive Care
                  </span>
                  <ReactStars
                    className="col-span-3 flex justify-self-end"
                    value={d3.mean(
                      lastYearPreventiveCare,
                      (d) => 6 - d['Quintile'],
                    )}
                    edit={false}
                  />
                </div>
              </button>
              <div
                className={`col-span-12 ${
                  open === 2 && subOpen === 2 ? 'block' : 'hidden'
                }`}
              >
                {lastYearPreventiveCare.map((d) => (
                  <div
                    key={d['Measure Full Name'] + d['Facility ID']}
                    className="grid grid-cols-12 col-span-12"
                  >
                    <span className="col-span-9 ">
                      {d['Measure Full Name']}:
                    </span>
                    <div className="flex gap-1 col-span-3 items-center justify-self-end">
                      <ReactStars value={6 - d['Quintile']} edit={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
