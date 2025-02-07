import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useState } from 'react';
import { Info } from '@phosphor-icons/react';
import { Chips } from 'primereact/chips';

export default function KeywordModal({
  header,
  keywordList,
  tooltip = 'This is a Self-Defined Category.\nPlease click for more details.',
}: {
  header: string;
  keywordList: string[];
  tooltip?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        className="p-0 bg-transparent border-0"
        tooltip={tooltip}
        tooltipOptions={{ position: 'top', className: 'w-100' }}
        onClick={(event) => {
          event.stopPropagation();
          setVisible(true);
        }}
      >
        <Info
          weight="fill"
          className="size-6 text-slate-400 hover:text-slate-500"
        />
      </Button>
      <div onClick={(event) => event.stopPropagation()}>
        <Dialog
          header={header}
          visible={visible}
          maximizable
          resizable
          className="w-[60rem]"
          dismissableMask
          blockScroll={true}
          onHide={() => {
            setVisible(false);
          }}
        >
          <Chips
            value={keywordList}
            allowDuplicate={false}
            separator=","
            placeholder={keywordList?.length > 0 ? '' : 'No keywords found'}
            disabled
            className="w-full mt-2 md:w-20rem"
            pt={{
              container: () => 'flex flex-wrap gap-1.5 w-full',
            }}
          />
        </Dialog>
      </div>
    </>
  );
}
