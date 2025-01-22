import KeywordModal from '../../pages/TriggerWords/ReviewTriggers/KeywordModal.tsx';
import UpdateKeywordModal from '../../pages/TriggerWords/ReviewTriggers/UpdateKeywordModal.tsx';

export default function NumberCards({
  className,
  value,
  initialValue,
  title,
  onClick,
  keywordModal = false,
  keywordList = [],
  editable = false,
  data,
  trigger_words = [],
  initialNewTrigger,
  setSelfDefinedKeywordsState,
  ...props
}: {
  className?: string;
  value: number;
  initialValue?: number;
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
        setSelfDefinedKeywordsState?: any;
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
        ' relative py-4.5  rounded-[30px] px-7.5  flex select-none ' +
        ' ' +
        className
      }
      {...props}
      onClick={onClick}
    >
      <div className="flex flex-col gap-[3px] w-full">
        <p className="text-3xl font-semibold">
          {value}{' '}
          {initialValue && value !== initialValue ? `of ${initialValue} ` : ''}
        </p>
        <div className="flex  items-center flex-nowrap justify-between">
          <h3 className="sm:whitespace-nowrap text-sm font-medium	">{title}</h3>
          <div>
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
                setSelfDefinedKeywordsState={setSelfDefinedKeywordsState}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
