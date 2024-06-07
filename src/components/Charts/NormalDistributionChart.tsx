import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';

const NormalDistributionChart = () => {
  // Generate sample data for normal distribution
  const generateNormalData = (size) => {
    return Array.from({ length: size }, () => Math.random());
  };

  // Initial state setup
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: 'line',
      zoom: {
        enabled: false,
      },
    },
    title: {
      text: 'Normal Distribution',
      align: 'left',
    },
    xaxis: {
      title: {
        text: 'Data',
      },
    },
    yaxis: {
      title: {
        text: 'Frequency',
      },
    },
  });

  const [chartSeries, setChartSeries] = useState([
    {
      name: 'Frequency',
      data: generateNormalData(1000),
    },
  ]);

  // Effect hook to update data
  useEffect(() => {
    // Update the series data here if needed
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height="350"
      />
    </div>
  );
};

export default NormalDistributionChart;
