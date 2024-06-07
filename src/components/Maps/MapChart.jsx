import React, { useState, useContext } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
} from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import { Tooltip } from 'react-tooltip';

const geoUrl = '/new_york_counties.json';

const MapChart = ({ colorData, selectedOption, location }) => {
  if (!colorData) return null;
  const [content, setContent] = useState('');
  const onlyValues = colorData.map((d) => d[1]);

  let marker = {};
  if (location === 'Providence Rest, Inc.') {
    marker = {
      offset: -30,
      offset_x: -90,
      coordinates: [-73.8175, 40.8375],
      textOffset: -8,
      anchor: 'end',
      name: 'Your Location',
    };
  } else if (location == 'Mercy Hospital Skilled Nursing Facility') {
    marker = {
      offset: -90,
      anchor: 'start',
      textOffset: 10,
      coordinates: [-78.8209, 42.8274],
      name: 'Your Location',
    };
  } else {
    marker = {
      offset: -30,
      offset_x: -90,
      textOffset: -8,
      anchor: 'end',
      coordinates: [-73.7791, 40.5949],
      name: 'Your Location',
    };
  }
  let colorArray = [
    '#00FF00',
    '#66FF00',
    '#CCFF00',
    '#FFFF00',
    '#FFCC00',
    '#FF9900',
    '#FF6600',
    '#FF3300',
    '#ff0000',
  ];

  let colorScale = scaleQuantile().domain(onlyValues).range(colorArray);
  if (
    selectedOption ===
      'Percent of long stay residents who received the seasonal influenza vaccine' ||
    selectedOption ===
      'Percent of long stay residents who received the pneumococcal vaccine'
  ) {
    colorArray = [
      '#ff0000',
      '#ff3300',
      '#ff6600',
      '#FF9900',
      '#FFCC00',
      '#FFFF00',
      '#CCFF00',
      '#66FF00',
      '#00FF00',
    ];
    colorScale = scaleQuantile().domain(onlyValues).range(colorArray);
  }

  return (
    <div className="relative rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h4 className="mb-2 text-xl font-semibold text-black dark:text-white select-none">
        State Map
      </h4>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [-76, 42.8], scale: 5500 }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const cur = colorData.find((s) => {
                return s[0] === geo['properties'].NAME;
              });
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  stroke="#fbfbfb"
                  strokeWidth={2}
                  className="anchor-class"
                  fill={cur ? colorScale(cur[1]) : '#fbfbfb'}
                  onMouseEnter={() => {
                    if (!cur) {
                      setContent({
                        name: geo['properties'].NAME,
                        mean_value: 'N/A',
                        q5_value: 'N/A',
                        q95_value: 'N/A',
                      });
                    }
                    setContent({
                      name: geo['properties'].NAME,
                      mean_value: cur[1],
                      q5_value: cur[2],
                      q95_value: cur[3],
                    });
                  }}
                  onMouseLeave={() => {
                    setContent('');
                  }}
                  style={{
                    default: {
                      outline: 'none',
                    },
                    hover: {
                      outline: 'none',
                    },
                    pressed: {
                      // fill: '#E42',
                      outline: 'none',
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
        <Marker coordinates={marker.coordinates}>
          <circle r={3} fill="#09f0e1" stroke="#09f0e1" strokeWidth={2} />
        </Marker>
        <Annotation
          subject={marker.coordinates}
          dx={marker.offset_x}
          dy={marker.offset}
          connectorProps={{
            stroke: '#09f0e1',
            strokeWidth: 3,
            strokeLinecap: 'round',
          }}
        >
          <text
            x={marker.textOffset}
            textAnchor={marker.anchor}
            alignmentBaseline="middle"
            fill="#09f0e1"
            style={{ fontSize: '1.3rem', fontWeight: 'bold' }}
          >
            Your Location
          </text>
        </Annotation>
      </ComposableMap>
      <Tooltip anchorSelect=".anchor-class" className="z-999">
        {content.name && (
          <p>
            {content.name}
            <br />
            Mean: {content.mean_value}
            <br />
            Lower Bound (5%): {content.q5_value}
            <br />
            Upper Bound (95%): {content.q95_value}
          </p>
        )}
      </Tooltip>
      <div className="absolute bottom-0 left-0 rounded-sm border border-stroke bg-white py-1 px-1 sm:py-3 sm:px-5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-7">
        <div className="flex flex-col gap-2 items-center">
          <h4 className="font-bold text-sm sm:text-base">Legend</h4>
          <div className="flex items-center justify-between sm:gap-2 gap-1">
            <span className="text-xs sm:text-sm">Better</span>
            <div className="h-3 w-12 sm:h-5 sm:w-20 bg-gradient-to-r from-[#00FF00] to-[#ff0000]" />
            <span className="text-xs sm:text-sm">Worse</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="rounded-full bg-[#00ffee] size-2 sm:size-3 " />
            <span className="text-xs sm:text-sm">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapChart;
