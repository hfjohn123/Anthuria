import clsx from 'clsx';

export default function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        'w-full bg-white dark:bg-boxdark rounded-[30px] p-7.5',
        className,
      )}
    >
      {children}
    </div>
  );
}
