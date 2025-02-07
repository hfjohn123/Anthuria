import { MeterGroup, MeterGroupValue } from 'primereact/metergroup';
const labelList = ({ values }: { values: MeterGroupValue[] }) => (
  <div className="flex flex-wrap gap-3">
    {values.map((item, index) => (
      <div key={index}>
        <p className="font-semibold">{item.label}</p>
        <p className="font-semibold">{item.value}</p>
      </div>
    ))}
  </div>
);

export default function SmallMeterGroup({
  values,
}: {
  values: MeterGroupValue[];
}) {
  return <MeterGroup className="w-80" values={values} />;
}
