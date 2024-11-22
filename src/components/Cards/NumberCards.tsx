import KeywordModal from '../../pages/TriggerWords/ReviewTriggers/KeywordModal.tsx';

export default function NumberCards({
  className,
  value,
  title,
  onClick,
  keywordModal = false,
  keywordList = [],
  ...props
}: {
  className?: string;
  value: number;
  title: string;
  keywordModal?: boolean;
  keywordList?: string[];
  onClick?: () => void;
  [key: string]: any;
}) {
  return (
    <div
      className={
        'shadow-default relative py-6 border border-stroke dark:border-strokedark rounded px-7.5  flex flex-col justify-center items-center ' +
        ' ' +
        className
      }
      {...props}
      onClick={onClick}
    >
      {keywordModal && (
        <KeywordModal
          keywordList={keywordList}
          header={'Keywords for ' + title}
        />
      )}
      <h3 className="sm:whitespace-nowrap text-sm sm:text-base text-center">
        {title}
      </h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
