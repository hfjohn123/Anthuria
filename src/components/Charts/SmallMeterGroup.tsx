import { MeterGroup, MeterGroupValue } from 'primereact/metergroup';
import clsx from 'clsx';
const labelList = ({ values }: { values: MeterGroupValue[] }) => {
  return (
    <ol className="p-metergroup-label-list p-metergroup-label-list-end p-metergroup-label-list-horizontal">
      {values.map((item, index) => {
        return (
          <li key={index} className="p-metergroup-label-list-item">
            <span
              className={clsx('p-metergroup-label-type ')}
              style={{ background: item.color }}
            />
            <span className="p-metergroup-label">
              {(item.label || '').toString()}{' '}
              {`(${Math.round(item.value || 0) > 0 && Math.round(item.value || 0) < 1 ? 'less than 1' : Math.round(item.value || 0)}%)`}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default function SmallMeterGroup({
  values,
}: {
  values: MeterGroupValue[];
}) {
  return (
    <MeterGroup className="min-w-80" values={values} labelList={labelList} />
  );
}
