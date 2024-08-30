const dateRangeFilterFn = (
  row: any,
  columnId: string,
  filterValue: [Date, Date],
) => {
  const value = new Date(row.getValue(columnId) as string | number | Date);
  return (
    filterValue[0] <= value &&
    new Date(
      new Date(filterValue[1]).setDate(new Date(filterValue[1]).getDate() + 1),
    ) >= value
  );
};

export default dateRangeFilterFn;
