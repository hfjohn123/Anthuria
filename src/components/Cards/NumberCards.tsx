export default function NumberCards({
  className,
  value,
  title,
  onClick,
  ...props
}: {
  className?: string;
  value: number;
  title: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  return (
    <div
      className={
        'shadow-default py-6 border border-stroke dark:border-strokedark rounded px-7.5  flex flex-col justify-center items-center ' +
        ' ' +
        className
      }
      {...props}
      onClick={onClick}
    >
      <h3 className="sm:whitespace-nowrap text-sm sm:text-base text-center">
        {title}
      </h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
