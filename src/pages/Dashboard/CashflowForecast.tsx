import DefaultLayout from '../../layout/DefaultLayout';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
// import tableview from 'billboard.js/dist/plugin/billboardjs-plugin-tableview';

import {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import Loader from '../../common/Loader';
import Select, {
  ClassNamesConfig,
  components,
  MultiValue,
  OptionProps,
  SingleValue,
  ValueContainerProps
} from 'react-select';
import { AuthContext } from '../../components/AuthWrapper.tsx';
import bb, { Chart, line, zoom } from 'billboard.js';
import DatePicker from 'react-datepicker';

import 'billboard.js/dist/billboard.css';
import 'react-datepicker/dist/react-datepicker.css';

const selectStyles: ClassNamesConfig<{
  label: string;
  value: string;
}> = {
  control: () => 'dark:border-form-strokedark dark:bg-form-input ',
  singleValue: () => 'dark:text-white',

  dropdownIndicator: (state) =>
    state.isFocused ? 'dark:text-white dark:hover:text-white' : '',
  clearIndicator: (state) =>
    state.isFocused ? 'dark:text-white dark:hover:text-white' : '',

  menu: () => 'dark:bg-form-input',
  option: (state) =>
    state.isFocused && !state.isSelected
      ? '!bg-transparent hover:!bg-blue-100'
      : ''
};
const today = new Date();
today.setHours(0, 0, 0, 0);

const ValueContainer = ({
                          children,
                          ...props
                        }: ValueContainerProps<{
  label: string;
  value: string;
}>): ReactElement => {
  const [values, input] = children as ReactElement[];
  const currentValues = props.getValue();
  const valueLength = currentValues.length;
  if (currentValues.some((val) => val.value === '*')) {
    return (
      <components.ValueContainer {...props}>
        <span>All {valueLength - 1} items selected</span>
        {input}
      </components.ValueContainer>
    );
  }
  return (
    <components.ValueContainer {...props}>
      {(valueLength > 0 && window.innerWidth < 1500) || valueLength > 2 ? (
        <span>{valueLength} items selected</span>
      ) : (
        values
      )}
      {input}
    </components.ValueContainer>
  );
};

const Option = (
  props: OptionProps<{
    label: string;
    value: string;
  }>
) => (
  <div>
    <components.Option {...props}>
      <input type="checkbox" checked={props.isSelected} onChange={() => null} />{' '}
      <label>{props.label}</label>
    </components.Option>
  </div>
);

export default function CashflowForecast() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    SingleValue<{
      label: string;
      value: string;
    }>
  >({ label: 'Monthly', value: 'monthly' });
  const selectAllOption = { label: 'Select all', value: '*' };
  const [selectedValues, setSelectedValues] = useState<
    MultiValue<{
      label: string;
      value: string;
    }>
  >([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const chartRef = useRef(null);
  const { route } = useContext(AuthContext);
  const [chartInterface, setChartInterface] = useState<Chart | null>();
  const period_options = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'daily', label: 'Daily' }
  ];
  const period = selectedPeriod ? selectedPeriod.value : null;
  const [zoomDomain, setZoomDomain] = useState<[Date, Date]>();
  let minDate;
  if (
    zoomDomain &&
    zoomDomain[1] &&
    chartInterface &&
    chartInterface?.categories()
  ) {
    minDate = new Date(chartInterface?.categories()[0]);
  } else if (zoomDomain && chartInterface && chartInterface?.categories()) {
    const date1 = new Date(zoomDomain[0]);
    if (period === 'monthly') {
      minDate = new Date(
        Math.min(
          new Date(
            chartInterface?.categories()[
            chartInterface?.categories().length - 1
              ]
          ).getTime(),
          new Date(new Date(date1).setMonth(date1.getMonth() + 5)).getTime()
        )
      );
    } else if (period === 'weekly') {
      minDate = new Date(
        Math.min(
          new Date(
            chartInterface?.categories()[
            chartInterface?.categories().length - 1
              ]
          ).getTime(),
          new Date(new Date(date1).setMonth(date1.getMonth() + 2)).getTime()
        )
      );
    }
  }
  const filterOption = (
    {
      label,
      value
    }: {
      label: string;
      value: string;
    },
    string: string
  ) => {
    // default search
    if (label.toLocaleLowerCase().includes(string.toLocaleLowerCase()))
      return true;

    // check if a group as the filter string as label
    const groupOptions = facilty_options.filter(
      (group: {
        label: string;
        options: {
          label: string;
          value: string;
        }[];
      }) =>
        group.label.toLocaleLowerCase().includes(string.toLocaleLowerCase())
    );

    if (groupOptions) {
      for (const groupOption of groupOptions) {
        // Check if current option is in group
        const option = groupOption.options.find(
          (opt: { value: string }) => opt.value === value
        );
        if (option) {
          return true;
        }
      }
    }
    return false;
  };

  const {
    isPending,
    isError,
    data: facilty_options,
    error
  } = useQuery({
    queryKey: ['dim_facility', route],
    queryFn: () => axios.get(`${route}/dim_facility`).then((res) => res.data)
  });

  const {
    isPending: dataIsPending,
    isError: dataIsError,
    data: data,
    error: dataError
  } = useQuery({
    queryKey: ['ar_predict_result', route, period, facilities],
    queryFn: () =>
      axios
        .post(`${route}/ar_predict_result/${period}`, facilities)
        .then((res) => res.data),
    enabled: !!period && facilities.length > 0
  });

  const handleChange = ([start, end]: [Date, Date]) => {
    setZoomDomain([
      start && chartInterface
        ? new Date(
          Math.max(
            start.getTime(),
            new Date(chartInterface?.categories()[0]).getTime()
          )
        )
        : start,
      end && chartInterface
        ? new Date(
          Math.min(
            new Date(end.getFullYear(), end.getMonth() + 1, 0).getTime(),
            new Date(
              chartInterface?.categories()[
              chartInterface?.categories().length - 1
                ]
            ).getTime()
          )
        )
        : end
    ]);
    chartInterface?.zoom([
      start && chartInterface
        ? new Date(
          Math.max(
            start.getTime(),
            new Date(chartInterface?.categories()[0]).getTime()
          )
        )
        : start,
      end && chartInterface
        ? new Date(
          Math.min(
            new Date(end.getFullYear(), end.getMonth() + 1, 0).getTime(),
            new Date(
              chartInterface?.categories()[
              chartInterface?.categories().length - 1
                ]
            ).getTime()
          )
        )
        : start
    ]);
  };
  const all_options = useMemo(() => {
    return facilty_options && facilty_options.length > 0
      ? facilty_options.flatMap(
        (entry: {
          options: {
            label: string;
            value: string;
          }[];
        }) => entry.options
      )
      : facilty_options;
  }, [facilty_options]);

  bb.defaults({
    data: {
      type: line(),
      keys: {
        x: 'ar_date',
        value: ['predict', 'actual']
      }
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          fit: false,
          count: window.innerWidth < 500 ? 3 : window.innerWidth < 1000 ? 4 : 5,
          outer: false,
          text: {
            // @ts-expect-error: Unreachable code error
            inner: true
          }
        },
        padding: { left: 100, right: 100 }
      },
      y: {
        tick: {
          format: function(d: number) {
            if (d < 1000) return '$' + d.toFixed(2);
            if (d < 1000000) return '$' + (d / 1000).toFixed(2) + 'K';
            if (d < 1000000000) return '$' + (d / 1000000).toFixed(2) + 'M';
            return '$' + (d / 1000000000).toFixed(2) + 'B';
          }
        },
        min: 0,
        padding: { bottom: 0 }
      }
    },
    transition: {
      duration: 0
    },
    zoom: {
      enabled: zoom(),
      onzoom(domain) {
        setZoomDomain(domain);
      }
    },
    point: {
      focus: {
        only: true
      }
    },
    grid: {
      x: {
        lines: [
          {
            value: today,
            text: 'Today',
            class: 'text-gray-500 [writing-mode:vertical-lr]'
          }
        ]
      }
    }
    // plugins: [
    //   new tableview({
    //     selector: '#my-table-view',
    //     categoryTitle: 'Time series',
    //     style: true,
    //     nullString: 'N/A',
    //   }),
    // ],
  });

  useEffect(() => {
    const chart =
      data && period === 'daily'
        ? bb.generate({
          bindto: chartRef.current,
          data: {
            json: data.data
          }
        })
        : data && period === 'weekly'
          ? bb.generate({
            bindto: chartRef.current,
            data: {
              json: data.data,
              xFormat: '%Y-%U'
            },
            axis: {
              x: {
                tick: {
                  format: '%Y\'s %U week - (%Y-%m-%d)'
                }
              }
            },
            grid: {
              x: {
                lines: [
                  {
                    value: new Date(today).setDate(
                      today.getDate() - today.getDay()
                    ),
                    text: 'This Week',
                    class: 'text-gray-500 [writing-mode:vertical-lr]'
                  }
                ]
              }
            }
          })
          : data && period === 'monthly'
            ? bb.generate({
              bindto: chartRef.current,
              data: {
                json: data.data,
                xFormat: '%Y-%m'
              },
              axis: {
                x: {
                  tick: {
                    format: '%Y-%m'
                  }
                }
              },
              grid: {
                x: {
                  lines: [
                    {
                      value: new Date(today).setDate(1),
                      text: 'This Month',
                      class: 'text-gray-500 [writing-mode:vertical-lr]'
                    }
                  ]
                }
              },
              zoom: {
                extent: [1, 4.9]
              }
            })
            : null;
    if (chart && chart.categories() && chart.categories().length > 0) {
      if (period === 'daily' || period === 'weekly') {
        const firstDate = new Date(
          Math.max(
            new Date(chart.categories()[0]).getTime(),
            new Date(
              new Date(today).setMonth(new Date(today).getMonth() - 1)
            ).getTime()
          )
        );
        const lastDate = new Date(
          Math.min(
            new Date(
              chart.categories()[chart.categories().length - 1]
            ).getTime(),
            new Date(
              new Date(today).setMonth(new Date(today).getMonth() + 1)
            ).getTime()
          )
        );
        chart.zoom([firstDate, lastDate]);
      } else {
        const firstDate = new Date(
          Math.max(
            new Date(chart.categories()[0]).getTime(),
            new Date(
              new Date(today).setMonth(new Date(today).getMonth() - 3)
            ).getTime()
          )
        );
        const lastDate = new Date(
          Math.min(
            new Date(
              chart.categories()[chart.categories().length - 1]
            ).getTime(),
            new Date(
              new Date(today).setMonth(new Date(today).getMonth() + 3)
            ).getTime()
          )
        );
        chart.zoom([firstDate, lastDate]);
      }
    }
    setChartInterface(chart);
    return () => {
      chart && chart.destroy();
    };
  }, [data, period]);

  if (isPending) {
    return <Loader />;
  }
  if (isError || dataIsError) {
    if (error)
      return (
        <DefaultLayout title={'Cashflow Forecast'}>
          <div>Error: {error.message}</div>
          {' '}
        </DefaultLayout>
      );
    if (dataError)
      return (
        <DefaultLayout title={'Cashflow Forecast'}>
          <div>Error: {dataError.message}</div>
        </DefaultLayout>
      );
  }

  return (
    <DefaultLayout title={'Cashflow Forecast'}>
      <div className="grid grid-cols-12 gap-1">
        <label
          className="font-medium text-nowrap col-span-12 lg:col-span-3 xl:col-span-2 self-center lg:justify-self-center ">
          Loan Group and Facility:
        </label>
        <Select
          classNames={{
            ...selectStyles,
            container: () => 'col-span-12 lg:col-span-6 xl:col-span-7'
          }}
          options={[selectAllOption, ...facilty_options]}
          hideSelectedOptions={false}
          backspaceRemovesValue={false}
          closeMenuOnSelect={false}
          blurInputOnSelect={false}
          isMulti
          value={selectedValues}
          filterOption={filterOption}
          components={{ ValueContainer, Option }}
          formatGroupLabel={(group) => {
            const hasGroupSelected = group.options.every((option) =>
              selectedValues.some(
                (selected) => selected.value === option.value
              )
            );
            return (
              <div
                className="flex items-center gap-1 border-b "
                onClick={() =>
                  hasGroupSelected
                    ? setSelectedValues((prev) =>
                      prev.filter(
                        (selected) =>
                          !group.options.some(
                            (option) => option.value === selected.value
                          ) && selected.value !== '*'
                      )
                    )
                    : setSelectedValues((prev) => {
                      let newOptions = [
                        ...group.options.filter(
                          (opt) =>
                            !prev.some(
                              (selected) => selected.value === opt.value
                            )
                        ),
                        ...prev
                      ];
                      newOptions.length === all_options.length
                        ? (newOptions = [...newOptions, selectAllOption])
                        : null;

                      return newOptions;
                    })
                }
              >
                <div className="flex justify-between flex-row w-full">
                  <div>
                    <input
                      type="checkbox"
                      onChange={() => null}
                      checked={hasGroupSelected}
                    />
                    {' '}{group.label}
                  </div>
                  <div className="rounded-full bg-gray size-5 flex justify-center items-center ">
                    {group.options.length}
                  </div>
                </div>
              </div>
            );
          }}
          onChange={(selected, event) => {
            if (selected !== null && selected.length > 0) {
              if (selected[selected.length - 1].value === '*') {
                return setSelectedValues([selectAllOption, ...all_options]);
              }
              let result: {
                label: string;
                value: string;
              }[] = [];
              if (selected.length === all_options.length) {
                if (selected.some((option) => option.value === '*')) {
                  result = selected.filter((option) => option.value !== '*');
                } else if (event.action === 'select-option') {
                  result = [selectAllOption, ...all_options];
                }
                return setSelectedValues(result);
              }
            }
            return setSelectedValues(selected);
          }}
          onMenuClose={() =>
            setFacilities(
              selectedValues
                .filter((val) => val.value !== selectAllOption.value)
                .map((val) => val.value)
            )
          }
        />
        <label
          className="font-medium text-nowrap col-span-12 lg:col-span-1 self-center justify-self-start  lg:justify-self-center">
          Period:
        </label>
        <Select
          classNames={{
            ...selectStyles,
            container: () => 'col-span-12 lg:col-span-2 '
          }}
          options={period_options}
          value={selectedPeriod}
          isMulti={false}
          onChange={(selected) => {
            setSelectedPeriod(selected);
          }}
        />

        <div
          className={`rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-6 col-span-12 mt-5`}
        >
          {data && period !== 'monthly' && (
            <div className="flex justify-between flex-col md:flex-row mb-5 gap-5">
              <div className="inline-flex rounded-md md:shadow-sm" role="group">
                <button
                  type="button"
                  className="px-2 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                  onClick={() => {
                    const firstDate =
                      chartInterface &&
                      new Date(
                        Math.max(
                          new Date(chartInterface.categories()[0]).getTime(),
                          new Date(
                            new Date(today).setMonth(
                              new Date(today).getMonth() - 1
                            )
                          ).getTime()
                        )
                      );
                    const lastDate =
                      chartInterface &&
                      new Date(
                        Math.min(
                          new Date(
                            chartInterface.categories()[
                            chartInterface.categories().length - 1
                              ]
                          ).getTime(),
                          new Date(
                            new Date(today).setMonth(
                              new Date(today).getMonth() + 1
                            )
                          ).getTime()
                        )
                      );
                    firstDate &&
                    lastDate &&
                    chartInterface &&
                    chartInterface.zoom([firstDate, lastDate]);
                  }}
                >
                  1 Month
                </button>
                <button
                  type="button"
                  className="px-2 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                  onClick={() => {
                    const firstDate =
                      chartInterface &&
                      new Date(
                        Math.max(
                          new Date(chartInterface.categories()[0]).getTime(),
                          new Date(
                            new Date(today).setMonth(
                              new Date(today).getMonth() - 3
                            )
                          ).getTime()
                        )
                      );
                    const lastDate =
                      chartInterface &&
                      new Date(
                        Math.min(
                          new Date(
                            chartInterface.categories()[
                            chartInterface.categories().length - 1
                              ]
                          ).getTime(),
                          new Date(
                            new Date(today).setMonth(
                              new Date(today).getMonth() + 3
                            )
                          ).getTime()
                        )
                      );
                    firstDate &&
                    lastDate &&
                    chartInterface &&
                    chartInterface.zoom([firstDate, lastDate]);
                  }}
                >
                  3 Months
                </button>
                <button
                  type="button"
                  className="px-2 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white  dark:focus:ring-blue-500 dark:focus:text-white"
                  onClick={() => {
                    chartInterface &&
                    setZoomDomain([
                      new Date(chartInterface.categories()[0]),
                      new Date(
                        chartInterface.categories()[
                        chartInterface.categories().length - 1
                          ]
                      )
                    ]);
                    chartInterface && chartInterface.unzoom();
                  }}
                >
                  ALL
                </button>
              </div>
              <div>
                <DatePicker
                  className="border py-1.5 px-3 rounded-lg"
                  onChange={handleChange}
                  selectsRange
                  startDate={zoomDomain ? zoomDomain[0] : undefined}
                  endDate={zoomDomain ? zoomDomain[1] : undefined}
                  dateFormat="MM/yyyy"
                  minDate={minDate}
                  maxDate={
                    chartInterface &&
                    new Date(
                      chartInterface.categories()[
                      chartInterface.categories().length - 1
                        ]
                    )
                  }
                  showMonthYearPicker
                />
              </div>
            </div>
          )}
          {data && period === 'monthly' && (
            <div className="flex justify-between flex-col md:flex-row mb-5 gap-5">
              <div className="inline-flex rounded-md md:shadow-sm" role="group">
                <button
                  type="button"
                  className="px-2 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                  onClick={() => {
                    const firstDate =
                      chartInterface &&
                      new Date(
                        Math.max(
                          new Date(chartInterface.categories()[0]).getTime(),
                          new Date(
                            new Date(today).setMonth(
                              new Date(today).getMonth() - 3
                            )
                          ).getTime()
                        )
                      );
                    const lastDate =
                      chartInterface &&
                      new Date(
                        Math.min(
                          new Date(
                            chartInterface.categories()[
                            chartInterface.categories().length - 1
                              ]
                          ).getTime(),
                          new Date(
                            new Date(today).setMonth(
                              new Date(today).getMonth() + 3
                            )
                          ).getTime()
                        )
                      );
                    firstDate &&
                    lastDate &&
                    chartInterface &&
                    chartInterface.zoom([firstDate, lastDate]);
                  }}
                >
                  3 Months
                </button>
                <button
                  type="button"
                  className="px-2 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
                  onClick={() => {
                    const firstDate =
                      chartInterface &&
                      new Date(
                        Math.max(
                          new Date(chartInterface.categories()[0]).getTime(),
                          new Date(
                            new Date(today).setMonth(
                              new Date(today).getMonth() - 6
                            )
                          ).getTime()
                        )
                      );
                    const lastDate =
                      chartInterface &&
                      new Date(
                        Math.min(
                          new Date(
                            chartInterface.categories()[
                            chartInterface.categories().length - 1
                              ]
                          ).getTime(),
                          new Date(
                            new Date(today).setMonth(
                              new Date(today).getMonth() + 6
                            )
                          ).getTime()
                        )
                      );
                    firstDate &&
                    lastDate &&
                    chartInterface &&
                    chartInterface.zoom([firstDate, lastDate]);
                  }}
                >
                  6 Months
                </button>
                <button
                  type="button"
                  className="px-2 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white  dark:focus:ring-blue-500 dark:focus:text-white"
                  onClick={() => {
                    chartInterface &&
                    setZoomDomain([
                      new Date(chartInterface.categories()[0]),
                      new Date(
                        chartInterface.categories()[
                        chartInterface.categories().length - 1
                          ]
                      )
                    ]);
                    chartInterface && chartInterface.unzoom();
                  }}
                >
                  ALL
                </button>
              </div>
              <div>
                <DatePicker
                  className="border py-1.5 px-3 rounded-lg"
                  onChange={handleChange}
                  selectsRange
                  startDate={zoomDomain ? zoomDomain[0] : undefined}
                  endDate={zoomDomain ? zoomDomain[1] : undefined}
                  dateFormat="MM/yyyy"
                  minDate={minDate}
                  maxDate={
                    chartInterface &&
                    new Date(
                      chartInterface.categories()[
                      chartInterface.categories().length - 1
                        ]
                    )
                  }
                  showMonthYearPicker
                />
              </div>
            </div>
          )}
          {data ? (
            <>
              <div
                // className="md:min-h-[60vh] lg:min-h-[67vh]"
                ref={chartRef}
              ></div>
              <p className="font-light italic">
                *Last Updated: {data.last_update}
              </p>
            </>
          ) : !!period && facilities.length > 0 && dataIsPending ? (
            <h1 className="font-semibold flex justify-center items-center h-50">
              Loading...
            </h1>
          ) : (
            <h1 className="font-semibold flex justify-center items-center h-50">
              Please select loan group and facility and period
            </h1>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
