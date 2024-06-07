import { ApexOptions } from 'apexcharts';
import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

function BellShapeChart({ data }) {
  if (!data) return null;
  const { mean, sd }: { mean: number; sd: number } = data;
  const label = [
    mean - 4 * sd,
    mean - 3 * sd,
    mean - 2 * sd,
    mean - 1 * sd,
    +mean,
    +mean + 1 * sd,
    +mean + 2 * sd,
    +mean + 3 * sd,
    +mean + 4 * sd,
  ];
  const calculateNormalDensity = (x, mean, stdDeviation) => {
    return (
      (1 / (stdDeviation * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((x - mean) / stdDeviation, 2))
    );
  };
  const new_data = [];
  for (let i = +mean - 4 * +sd; i <= +mean + 4 * +sd; i += +sd / 10) {
    new_data.push([i, calculateNormalDensity(i, +mean, +sd)]);
  }
  console.log(new_data);

  // console.log(new_data);
  const [state, setState] = useState({
    series: [
      {
        name: "This Facility's Value",
        type: 'line',
        data: new_data,
      },
    ],
  });
  const options: ApexOptions = {
    legend: {
      show: false,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#80CAEE'],
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
            height: 350,
          },
        },
      },
    ],
    fill: {
      colors: ['#94ddf7', '#FFFFFF', `#FFFFFF`],
      opacity: [0.5, 1.0, 1.0],
      type: 'solid',
    },
    stroke: {
      width: [2, 2, 5],
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
      strokeColors: ['#3056D3', '#80CAEE'],
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
      type: 'category',
      categories: label,
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
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5 ">
          <div className="flex grow">
            <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">
                This Facility's Value
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
          <p className="absolute right-0 bottom-5 text-xs hidden md:block sele">
            2021
          </p>
        </div>
      </div>
    </div>
  );
}

export default BellShapeChart;
