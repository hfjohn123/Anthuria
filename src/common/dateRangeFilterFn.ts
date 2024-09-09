const dateRangeFilterFn = (
  row: any,
  columnId: string,
  filterValue: [Date, Date],
) => {
  const value = new Date(row.getValue(columnId) as string | number | Date);
  return filterValue[0] <= value && filterValue[1] >= value;
};

export default dateRangeFilterFn;
