import number_formate from '../../common/number_formate.ts';

export default function NumberCards({
  className,
  value,
  title,
}: {
  className?: string;
  value: number;
  title: string;
}) {
  return (
    <div
      className={
        'bg-white dark:bg-boxdark shadow-default py-6 border border-stroke dark:border-strokedark rounded px-7.5  flex flex-col justify-center items-center ' +
        ' ' +
        className
      }
    >
      <h3 className="items-center">{title}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
