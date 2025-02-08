import Modal from '../Modal/Modal.tsx';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import Select, { MultiValue } from 'react-select';
import {
  ColumnDefTemplate,
  HeaderContext,
  Table,
  TableState,
} from '@tanstack/react-table';
import { TriggerFinal } from '../../types/TriggerFinal.ts';
import { Button } from '@headlessui/react';
import { useState } from 'react';

export default function TableSettingModal({
  title,
  table,
  tableState,
  setTableState,
  initialTableState,
}: {
  title?: string;
  table: Table<any>;
  tableState: TableState;
  setTableState: React.Dispatch<React.SetStateAction<TableState>>;
  initialTableState?: TableState;
}) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  return (
    <Modal
      isOpen={showSettingsModal}
      setIsOpen={setShowSettingsModal}
      title={(title || '') + ' Settings'}
      button={<Cog6ToothIcon />}
      classNameses={{
        button: 'size-6 mr-2 text-gray-900 hover:text-primary',
      }}
    >
      <div className="px-4">
        <label>Column Visibility</label>
        <Select
          options={table
            .getAllColumns()
            .filter((c) => c.getCanHide())
            .map((c) => {
              return {
                value: c.id,
                label: c.columnDef.header,
              };
            })
            .filter(({ value }) => value !== 'status')}
          isMulti
          hideSelectedOptions={false}
          isClearable={false}
          isSearchable={false}
          closeMenuOnSelect={false}
          classNames={{ control: () => 'sm:w-[50vw]' }}
          value={Object.entries(tableState.columnVisibility)
            .filter(([_, v]) => v)
            .map(([k]) => {
              return {
                label: table.getColumn(k)?.columnDef.header,
                value: k,
              };
            })}
          onChange={(
            selected: MultiValue<{
              label:
                | ColumnDefTemplate<HeaderContext<TriggerFinal, unknown>>
                | undefined;
              value: string;
            }>,
          ) => {
            setTableState((prev) => ({
              ...prev,
              columnVisibility: {
                ...table
                  .getAllColumns()
                  .reduce((acc, c) => ({ ...acc, [c.id]: false }), {}),
                ...selected.reduce(
                  (acc, c) => ({ ...acc, [c.value]: true }),
                  {},
                ),
              },
            }));
          }}
        />
        {initialTableState && (
          <Button
            onClick={() =>
              setTableState((prev) => ({
                ...prev,
                columnVisibility: initialTableState.columnVisibility,
              }))
            }
          >
            Reset to default
          </Button>
        )}
      </div>
    </Modal>
  );
}
