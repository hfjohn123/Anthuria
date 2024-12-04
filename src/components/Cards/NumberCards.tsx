import KeywordModal from '../../pages/TriggerWords/ReviewTriggers/KeywordModal.tsx';
import UpdateKeywordModal from '../../pages/TriggerWords/ReviewTriggers/UpdateKeywordModal.tsx';

export default function NumberCards({
  className,
  value,
  title,
  onClick,
  keywordModal = false,
  keywordList = [],
  editable = false,
  data,
  trigger_words = [],
  initialNewTrigger,
  ...props
}: {
  className?: string;
  value: number;
  title: string;
  keywordModal?: boolean;
  keywordList?: string[];
  onClick?: () => void;
  [key: string]: any;
} & (
  | {
      editable: true;
      data: any;
      trigger_words: string[];
      initialNewTrigger: {
        group_name: string;
        trigger_word: string;
        internal_facility_id: string[];
        keyword_list: string[];
      };
    }
  | {
      editable?: false;
      data?: any;
      trigger_words?: string[];
      initialNewTrigger?: {
        group_name: string;
        trigger_word: string;
        internal_facility_id: string[];
        keyword_list: string[];
      };
    }
)) {
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
      {keywordModal && !editable && (
        <KeywordModal
          keywordList={keywordList}
          header={'Keywords for ' + title}
        />
      )}
      {keywordModal && editable && initialNewTrigger && (
        <UpdateKeywordModal
          data={data}
          trigger_words={trigger_words}
          initialNewTrigger={initialNewTrigger}
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
