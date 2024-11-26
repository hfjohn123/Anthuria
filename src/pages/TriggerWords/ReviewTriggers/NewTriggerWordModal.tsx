import { Field, Label } from '@headlessui/react';
import { useContext, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { createToast } from '../../../hooks/fireToast.tsx';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { Chips } from 'primereact/chips';

const initialNewTrigger: {
  trigger_word: string;
  internal_facility_id: string[];
  keyword_list: string[];
} = {
  trigger_word: '',
  internal_facility_id: [],
  keyword_list: [],
  // date_range: [new Date(), new Date()],
};

export default function NewTriggerWordModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [newTriggerWord, setNewTriggerWord] = useState<{
    trigger_word: string;
    internal_facility_id: string[];
    keyword_list: string[];
    // date_range: [Date | null, Date | null];
  }>(initialNewTrigger);

  const addTemporary = useMutation({
    mutationFn: ({
      trigger_word,
      user_id,
      facilities,
      // from_to,
    }: {
      trigger_word: string;
      user_id: string;
      facilities: string[];
      // from_to: [Date | null, Date | null];
    }) =>
      axios.post(
        `https://triggerword_temporary_api.triedgesandbox.com/create_trigger`,
        {
          trigger_word,
          facilities,
          user_id,
          // from_to,
          status: 'temporary',
        },
      ),
    onSuccess: () => {
      createToast(
        'Success',
        'Trigger Word Creation in Progress',
        0,
        'new trigger',
      );
    },
  });

  const { user_applications_locations, user_data } = useContext(AuthContext);
  const { locations } = user_applications_locations.find(
    (d) => d['id'] === 'trigger_words',
  ) || { locations: [] };
  // console.log(newTriggerWord);
  return (
    <>
      <Button
        label="Add a New Trigger Word"
        icon="pi pi-plus"
        className="p-1 bg-transparent border-0 text-primary dark:text-secondary col-span-12 lg:col-span-3 lg:justify-self-end justify-self-start self-center"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        header="Create a New Trigger Word"
        visible={isOpen}
        style={{ width: '50vw' }}
        onHide={() => {
          if (!isOpen) return;
          setIsOpen(false);
        }}
        maximizable
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTemporary.mutate({
              trigger_word: newTriggerWord.trigger_word,
              facilities: newTriggerWord.internal_facility_id,
              user_id: user_data.email,
              // from_to: newTriggerWord.date_range,
            });
            setIsOpen(false);
            setNewTriggerWord(initialNewTrigger);
          }}
          className="px-4"
        >
          <div className="flex flex-col gap-6">
            <Field>
              <Label className="text-sm dark:text-bodydark2">
                New Trigger Word
              </Label>
              <InputText
                required
                value={newTriggerWord.trigger_word}
                onChange={(e) => {
                  setNewTriggerWord((prev) => ({
                    ...prev,
                    trigger_word: e.target.value,
                  }));
                }}
                size="large"
                className="w-full"
                type="text"
              />
            </Field>
            <Field className="flex flex-col">
              <Label className="text-sm dark:text-bodydark2">Facility</Label>
              <MultiSelect
                required
                value={newTriggerWord.internal_facility_id}
                optionLabel="label"
                optionValue="value"
                display="chip"
                onChange={(e) => {
                  setNewTriggerWord((prev) => ({
                    ...prev,
                    internal_facility_id: e.value,
                  }));
                }}
                options={locations.map(
                  ({ internal_facility_id, facility_name }) => ({
                    label: facility_name,
                    value: internal_facility_id,
                  }),
                )}
                filter
                pt={{
                  label: () => 'flex flex-wrap gap-1.5',
                }}
              />
            </Field>
            <Field>
              <Label className="text-sm dark:text-bodydark2">Keywords</Label>
              <Chips
                value={newTriggerWord.keyword_list}
                placeholder={
                  newTriggerWord.keyword_list?.length > 0
                    ? ''
                    : 'Enter keywords...'
                }
                onChange={(e) => {
                  setNewTriggerWord((prev) => ({
                    ...prev,
                    keyword_list: e.value || [],
                  }));
                }}
                allowDuplicate={false}
                className="w-full mt-2 md:w-20rem"
                separator=","
                pt={{
                  container: () => 'flex flex-wrap gap-1.5 w-full',
                }}
              />
            </Field>
            {/*<Field>*/}
            {/*  <Label className="block text-sm dark:text-bodydark2">*/}
            {/*    Date Range*/}
            {/*  </Label>*/}
            {/*  <DatePicker*/}
            {/*    startDate={newTriggerWord.date_range[0] ?? undefined}*/}
            {/*    endDate={newTriggerWord.date_range[1] ?? undefined}*/}
            {/*    maxDate={*/}
            {/*      newTriggerWord.date_range[1]*/}
            {/*        ? new Date()*/}
            {/*        : new Date(*/}
            {/*            Math.min(*/}
            {/*              new Date().getTime(),*/}
            {/*              newTriggerWord.date_range[0]*/}
            {/*                ? new Date(newTriggerWord.date_range[0]).setDate(*/}
            {/*                    new Date(*/}
            {/*                      newTriggerWord.date_range[0],*/}
            {/*                    ).getDate() + 7,*/}
            {/*                  )*/}
            {/*                : new Date().getTime(),*/}
            {/*            ),*/}
            {/*          )*/}
            {/*    }*/}
            {/*    onChange={(e) => {*/}
            {/*      setNewTriggerWord((prev) => ({*/}
            {/*        ...prev,*/}
            {/*        date_range: e,*/}
            {/*      }));*/}
            {/*    }}*/}
            {/*    selectsRange*/}
            {/*    wrapperClassName="w-full"*/}
            {/*    className="dark:bg-boxdark indent-2.5 py-1.5 border border-stroke rounded w-full outline-none focus:shadow-filter focus:shadow-blue-400 dark:text-bodydark1"*/}
            {/*  />*/}
            {/*</Field>*/}
            <div className="flex gap-4 justify-end">
              <button
                type="reset"
                className="dark:text-bodydark1"
                onClick={() => {
                  setIsOpen(false);
                  setNewTriggerWord(initialNewTrigger);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white dark:text-bodydark1 rounded p-2"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
}
