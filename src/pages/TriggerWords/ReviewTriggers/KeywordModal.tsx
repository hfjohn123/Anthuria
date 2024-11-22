import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useState } from 'react';
import { MultiSelect } from 'primereact/multiselect';
import { Info } from '@phosphor-icons/react';

export default function KeywordModal({
  header,
  keywordList,
}: {
  header: string;
  keywordList: string[];
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        className="absolute top-1 right-1 p-0 bg-transparent border-0"
        onClick={(event) => {
          event.stopPropagation();
          setVisible(true);
        }}
      >
        <Info
          weight="fill"
          className="size-6 text-slate-300 hover:text-slate-400"
        />
      </Button>
      <div onClick={(event) => event.stopPropagation()}>
        <Dialog
          header={header}
          visible={visible}
          maximizable
          style={{ width: '50vw' }}
          dismissableMask
          onHide={() => {
            setVisible(false);
          }}
        >
          <MultiSelect
            value={keywordList.map((keyword) => ({
              name: keyword,
              code: keyword,
            }))}
            options={keywordList.map((keyword) => ({
              name: keyword,
              code: keyword,
            }))}
            optionLabel="name"
            disabled
            display="chip"
            placeholder="Select Keywords"
            className="w-full mt-2 md:w-20rem"
            pt={{
              label: () => 'flex flex-wrap gap-1.5',
            }}
          />
        </Dialog>
      </div>
    </>
  );
}
