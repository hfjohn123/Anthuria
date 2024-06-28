import React, { useContext, useEffect, useState, useRef } from 'react';
import CardDataStats from '../../components/Cards/CardDataStats';
import LineChart from '../../components/Charts/LineChart';
import MapChart from '../../components/Maps/MapChart';
import DefaultLayout from '../../layout/DefaultLayout';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import { AuthContext } from '../../components/AuthWrapper.tsx';
import * as d3 from 'd3';
import Loader from '../../common/Loader';
import Table from '../../components/Tables/Table';
import Accordion from '../../components/Accordions/Accordion';
import SelectGroupOne from '../../components/Forms/SelectGroup/SelectGroupOne.tsx';

const options = [
  'Percent of long stay high risk residents with pressure ulcers',
  'Percent of long stay low risk residents who lose control of their bowel or bladder',
  'Percent of long stay residents with a urinary tract infection',
  'Percent of long stay residents who received the seasonal influenza vaccine',
  'Percent of long stay residents who received the pneumococcal vaccine',
];
const lowerBetterList = [true, true, true, false, false];

function handleSort(a: any[], b: any[]) {
  if (!a || !b || a.length === 0 || b.length === 0) {
    return 0;
  }
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] > b[0] ? 1 : -1;
  }
}

const NHQI: React.FC = () => {
  const { user_applications_locations } = useContext(AuthContext);
  const noahdata = user_applications_locations.filter(
    (d) => d['id'] === 'nhqi',
  )[0];
  const locations: { facility_name: string }[] = noahdata['locations'];
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [data, setData] = useState(null);
  const [tabledata, setTabledata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState(null);
  const [location, setLocation] = useState(locations[0]['facility_name']);
  const [cardData, setCardData] = useState(null);
  const [accordionData, setAccordionData] = useState(null);
  const locationsOptions = locations.map((d) => d['facility_name']);



  function handleSelectLocation(option: string) {
    setLocation(option);
  }

  useEffect(() => {
    setLoading(true);
    const lowerBetter = lowerBetterList[options.indexOf(selectedOption)];

    const fetchData = async (location: string) => {
      const url = './out.csv';
      const rawData = await d3.csv(url);
      const thisMeasure = rawData.filter(
        (d) => d['Measure Full Name'] === selectedOption,
      );
      const county = thisMeasure?.find((d) => {
        if (d['Facility Name'] === location) {
          return d['County'];
        }
      })['County'];
      const lastyear = d3.max(thisMeasure, (d) => d['Measurement Year']);
      let lastyearData = thisMeasure.filter(
        (d) => d['Measurement Year'] === lastyear,
      );
      const groupsCounties = d3.group(lastyearData, (d) => d['County']);
      let counties: (string | number | undefined)[][] = [];
      groupsCounties.forEach((d) => {
        const c_mean = d3.mean(d, (d) => parseFloat(d['Numeric Value']));
        const c_5 = d3.quantile(d, 0.05, (d) => parseFloat(d['Numeric Value']));
        const c_95 = d3.quantile(d, 0.95, (d) =>
          parseFloat(d['Numeric Value']),
        );
        counties.push([
          d[0]['County'],
          parseFloat(c_mean).toFixed(2),
          parseFloat(c_5).toFixed(2),
          parseFloat(c_95).toFixed(2),
        ]);
      });
      setMapData(counties);
      lastyearData = lastyearData.sort(
        (a, b) => a['Numeric Value'] - b['Numeric Value'],
      );
      const filteredData = thisMeasure
        ? thisMeasure.filter((d) => {
            return county && d['County'] === county;
          })
        : [];
      const lastyearFilteredData = lastyearData
        ? lastyearData.filter((d) => {
            return county && d['County'] === county;
          })
        : [];
      setTabledata(lastyearFilteredData);
      setCardData(
        lastyearFilteredData.filter((d) => d['Facility Name'] === location)[0],
      );
      let bestCenterScore = d3.max(
        lastyearFilteredData,
        (d) => d['Numeric Value'],
      );
      if (lowerBetter) {
        bestCenterScore = d3.min(
          lastyearFilteredData,
          (d) => d['Numeric Value'],
        );
      }
      const bestCenter = lastyearFilteredData.find(
        (d) => d['Numeric Value'] === bestCenterScore,
      )['Facility Name'];
      const bestCenterData = rawData.filter(
        (d) => d['Facility Name'] === bestCenter,
      );
      const bestCenterMeasureGroups = d3.group(
        bestCenterData,
        (d) => d['Measure Full Name'],
      );
      let lastYearBestCenterData = [];
      bestCenterMeasureGroups.forEach((d) => {
        const bestYearOfMeasure = d3.max(d, (d) => d['Measurement Year']);
        lastYearBestCenterData.push(
          d.find((d) => d['Measurement Year'] === bestYearOfMeasure),
        );
      });
      const myCenterData = rawData.filter(
        (d) => d['Facility Name'] === location,
      );
      const myCenterMeasureGroups = d3.group(
        myCenterData,
        (d) => d['Measure Full Name'],
      );
      let myYearData = [];
      myCenterMeasureGroups.forEach((d) => {
        const bestYearOfMeasure = d3.max(d, (d) => d['Measurement Year']);
        myYearData.push(
          d.find((d) => d['Measurement Year'] === bestYearOfMeasure),
        );
      });

      const accordionData = {
        myYearData,
        lastYearBestCenterData,
      };
      setAccordionData(accordionData);
      const groups = d3.group(filteredData, (d) => d['Measurement Year']);
      let five_qs: (string | number | undefined)[][] = [];
      let ninetyFive_qs: (string | number | undefined)[][] = [];
      let mean_qs: (string | number | undefined)[][] = [];
      let self_data: string[][] = [];

      groups.forEach((d) => {
        const five_q = d3.quantile(d, 0.05, (d) =>
          parseFloat(d['Numeric Value']),
        );
        const ninety_q = d3.quantile(d, 0.95, (d) =>
          parseFloat(d['Numeric Value']),
        );
        const mean_q = d3.mean(d, (d) => parseFloat(d['Numeric Value']));
        const self = d.find(
          (datapoint) => datapoint['Facility Name'] === location,
        );
        five_qs.push([d[0]['Measurement Year'], parseFloat(five_q).toFixed(1)]);
        ninetyFive_qs.push([
          d[0]['Measurement Year'],
          parseFloat(ninety_q).toFixed(1),
        ]);
        mean_qs.push([d[0]['Measurement Year'], parseFloat(mean_q).toFixed(1)]);
        if (self) {
          self_data.push([
            d[0]['Measurement Year'],
            parseFloat(self['Numeric Value']).toFixed(1),
          ]);
        }
      });
      five_qs = five_qs.sort(handleSort);
      ninetyFive_qs = ninetyFive_qs.sort(handleSort);
      mean_qs = mean_qs.sort(handleSort);
      self_data = self_data.sort(handleSort);
      setData({ five_qs, ninetyFive_qs, mean_qs, self_data, lastyear });
    };
    fetchData(location).finally(() => {
      setLoading(false);
    });
  }, [selectedOption, location]);
  if (loading) {
    return <Loader />;
  }
  return (
    data && (
      <DefaultLayout>
        <Breadcrumb
          title={selectedOption}
          options={options}
          isDropDown
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
        <div className="gap-4 xl:gap-6 2xl:gap-7.5 grid grid-cols-12">
          <div className="col-span-12 xl:col-span-4 xl:order-1 z-10 flex flex-col sm:flex-row lg:sticky lg:top-20 lg:bg-whiten lg:dark:bg-boxdark-2 xl:flex-col xl:gap-6 2xl:gap-7.5 xl:h-min xl:top-25 gap-4 sm:gap-0 sm:flex-wrap sm:gap-y-4">
            <SelectGroupOne
              options={locationsOptions}
              label="Facility:"
              labelLeft
              handleSelectOption={handleSelectLocation}
              selectedOption={location}
              className={'sm:basis-full'}
            />
            <CardDataStats
              title={selectedOption}
              data={cardData}
              currentCenter={data.self_data}
              lowerBetter={lowerBetterList[options.indexOf(selectedOption)]}
            />
            <Accordion data={accordionData} options={options} />
          </div>
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-4 md:gap-8 2xl:gap-7.5 ">
            <MapChart
              colorData={mapData}
              selectedOption={selectedOption}
              location={location}
            />
            <LineChart data={data} />
            <Table data={tabledata} />
          </div>
        </div>
      </DefaultLayout>
    )
  );
};

export default NHQI;
