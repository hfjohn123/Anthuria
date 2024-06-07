import React, { ReactNode, useState } from 'react';

interface CardDataStatsProps {
  data?: any;
  title: string;
  currentCenter: any;
  children: ReactNode;
  lowerBetter: boolean;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  data,
  currentCenter,
  lowerBetter,
}) => {
  const [clicked, setClicked] = useState(false);
  const previous = +currentCenter[currentCenter.length - 2][1];
  let color = 'text-meta-3';
  let fill_color = 'fill-meta-3';
  if (lowerBetter && previous < data['Numeric Value']) {
    color = 'text-meta-1';
    fill_color = 'fill-meta-1';
  } else if (previous == data['Numeric Value']) {
    color = 'text-meta-6';
    fill_color = 'fill-meta-6';
  } else if (!lowerBetter && previous > data['Numeric Value']) {
    color = 'text-meta-1';
    fill_color = 'fill-meta-1';
  }
  return (
    <div className="rounded-sm basis-1/2 xl:basis-0 border border-stroke bg-white pb-3 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className=" flex items-end justify-between">
        <div className="flex-1">
          <h4 className="text-title-lg font-bold text-black dark:text-white py-3">
            {data['Numeric Value']}
          </h4>
          <p className="text-md font-medium">{title}</p>
          <p className="text-sm italic">
            Tip: The {lowerBetter ? 'lower' : 'higher'} the better!
          </p>
        </div>

        <span
          className={`flex items-center gap-1 text-sm font-medium ${color} cursor-pointer `}
          onClick={() => setClicked(!clicked)}
        >
          {clicked
            ? Math.abs(data['Numeric Value'] - previous).toFixed(2)
            : (
                (Math.abs(data['Numeric Value'] - previous) / previous) *
                100
              ).toFixed(2) + '%'}

          {previous < data['Numeric Value'] && (
            <svg
              className={fill_color}
              width="10"
              height="11"
              viewBox="0 0 10 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
                fill=""
              />
            </svg>
          )}
          {previous > data['Numeric Value'] && (
            <svg
              className={fill_color}
              width="10"
              height="11"
              viewBox="0 0 10 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.64284 7.69237L9.09102 4.33987L10 5.22362L5 10.0849L-8.98488e-07 5.22362L0.908973 4.33987L4.35716 7.69237L4.35716 0.0848701L5.64284 0.0848704L5.64284 7.69237Z"
                fill=""
              />
            </svg>
          )}
        </span>
      </div>
    </div>
  );
};

export default CardDataStats;
