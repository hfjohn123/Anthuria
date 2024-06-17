import EChartWrapper from "../Charts/EChartWrapper.tsx";
import {EChartsOption} from "echarts";


export default function GaugeCards({className} : {className: string}) {
  const option: EChartsOption = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '75%'],
        radius: '90%',
        min: 0,
        max: 1,
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.25, '#DC3545'],
              [0.5, '#FFBA00'],
              [0.75, '#259AE6'],
              [1, '#10B981']
            ]
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2
          }
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 5
          }
        },
        axisLabel: {
          color: '#464646',
          fontSize: 10,
          distance: -40,
          rotate: 'tangential',
          formatter: function (value) {
            if (value === 0.75) {
              return 'Grade A';
            } else if (value === 0.625) {
              return 'Grade B';
            } else if (value === 0.375) {
              return 'Grade C';
            } else if (value === 0.125) {
              return 'Grade D';
            }
            return '';
          }
        },
        title: {
          offsetCenter: [0, '-10%'],
          fontSize: 10
        },
        detail: {
          fontSize: 20,
          offsetCenter: [0, '-35%'],
          valueAnimation: true,
          formatter: function (value) {
            return Math.round(value * 100) + '';
          },
          color: 'inherit'
        },
        data: [
          {
            value: 0.7,
            name: 'Grade Rating'
          }
        ]
      }
    ]
  };
  return (
    <div className= {className + ' bg-white dark:bg-boxdark shadow-default '}>
      <EChartWrapper option = {option }/>
    </div>
  )
}
