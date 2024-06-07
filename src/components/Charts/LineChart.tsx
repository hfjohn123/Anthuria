import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

function LineChart({ data, className }: { data: any; className: string }) {
  if (!data) return null;
  useEffect(() => {
    const handleStorageChange = () => {
      const darkMode = localStorage.getItem('color-theme');
      setDarkMode(darkMode === '"dark"');
    };

    // Add event listener for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const { five_qs, ninetyFive_qs, mean_qs, self_data, lastyear } = data;
  const state = {
    series: [
      {
        name: '95%',
        type: 'area',
        data: ninetyFive_qs,
      },

      {
        name: '5%',
        type: 'area',
        data: five_qs,
      },
      {
        name: 'Average',
        type: 'line',
        data: mean_qs,
      },
      {
        name: "This Facility's Value",
        type: 'line',
        data: self_data,
      },
    ],
  };
  const [darkMode, setDarkMode] = useState(false);
  const options: ApexOptions = {
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#80CAEE', '#80CAEE', '#80CAEE', '#3C50E0'],
    chart: {
      zoom: {
        enabled: false,
      },
      fontFamily: 'Satoshi, sans-serif',
      height: 335,
      stacked: false,

      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 300,
          },
        },
      },
    ],
    fill: {
      colors: ['#94ddf7', '#FFFFFF', `#FFFFFF`, , `#FFFFFF`],
      opacity: [0.5, 1.0, 1.0, 1.0],
      type: 'solid',
    },
    stroke: {
      width: [2, 2, 3, 5],
      curve: 'straight',
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: '#fff',
      strokeColors: ['#80CAEE', '#80CAEE', '#80CAEE', '#3056D3'],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    tooltip: {
      x: {
        format: 'yyyy',
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'yyyy',
      },
      tickAmount: 1,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      // title: {
      //   style: {
      //     fontSize: '0px',
      //   },
      // },
    },
  };
  if (darkMode) {
    options.fill = {
      colors: ['#94ddf7', 'rgb(39,48,63)', `rgb(39,48,63)`, `rgb(39,48,63)`],
      opacity: [0.5, 1.0, 1.0, 1.0],
      type: 'solid',
    };
  }

  // const handleReset = () => {
  //   setState((prevState) => ({
  //     ...prevState,
  //   }));
  // };
  // handleReset;
  return (
    <div
      className={`rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6 ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5 ">
          <div className="flex grow">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">
                This Facility&apos;s Value
              </p>
            </div>
          </div>
          <div className="flex grow ">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-secondary bl">
                95% Confidence Interval
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5 relative">
          <ReactApexChart
            options={options}
            series={state.series}
            type="area"
            height={350}
          />
          <p className="absolute right-0 bottom-5 text-xs hidden md:block sele select-none">
            {lastyear}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LineChart;
