import { Field, Label } from '@headlessui/react';
import { useContext, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { createToast } from '../../../hooks/fireToast.tsx';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { Chips } from 'primereact/chips';
import { Column } from 'primereact/column';
import { TriggerFinal } from '../../../types/TriggerFinal.ts';
import { stemmer } from 'stemmer';
import ShowMoreText from 'react-show-more-text';
import { Toast } from 'primereact/toast';
import stemFiltering from '../../../common/stemFiltering.ts';
import { DataTable } from 'primereact/datatable';
import highlightColors from '../../../common/highlightColors.ts';
import clsx from 'clsx';

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
const patientNameTemplate = (d: TriggerFinal) => {
  return (
    <div>
      <p>{d.patient_name}</p>
      <p className="text-body-2">{d.facility_name}</p>
    </div>
  );
};

const progressNoteTemplate = (d: TriggerFinal) => {
  return (
    <ShowMoreText
      className="whitespace-pre-line"
      keepNewLines
      anchorClass="text-primary cursor-pointer block dark:text-secondary "
    >
      {d.progress_note}
    </ShowMoreText>
  );
};

const getColorClass = (index: number) => {
  return highlightColors[index % highlightColors.length];
};

const customTemplate = (item: string, result: string[]) => {
  const index = result.indexOf(item);
  return <span className={`${getColorClass(index)}`}>{item}</span>;
};

export default function NewTriggerWordModal({
  data,
  trigger_words,
}: {
  data: TriggerFinal[];
  trigger_words: string[];
}) {
  const toast = useRef<Toast>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [newTriggerWord, setNewTriggerWord] = useState<{
    trigger_word: string;
    internal_facility_id: string[];
    keyword_list: string[];
    // date_range: [Date | null, Date | null];
  }>(initialNewTrigger);

  const { user_applications_locations, route } = useContext(AuthContext);
  const { locations } = user_applications_locations.find(
    (d) => d['id'] === 'trigger_words',
  ) || { locations: [] };
  const addTemporary = useMutation({
    mutationFn: ({
      trigger_word,
      // user_id,
      facilities,
      // from_to,
    }: {
      trigger_word: string;
      // user_id: string;
      facilities: string[];
      // from_to: [Date | null, Date | null];
    }) =>
      axios.put(`${route}/create_trigger`, {
        trigger_word,
        facilities,
        // from_to,
      }),
    onSuccess: () => {
      createToast(
        'Success',
        'Trigger Word Creation in Progress, It would appear tomorrow',
        0,
        'new trigger',
      );
    },
    onError: (error: AxiosError) => {
      createToast(
        'Something went wrong',
        (error.response?.data as { detail: string }).detail,
        1,
        'new trigger',
      );
    },
  });
  const show = () => {
    toast.current?.show({
      severity: 'error',
      summary: 'Error',
      detail: 'Trigger word already exists',
    });
  };

  const filteredData =
    data &&
    data.filter((d) =>
      newTriggerWord.keyword_list.some(
        (keyword) => d.progress_note && stemFiltering(d.progress_note, keyword),
      ),
    );
  return (
    <>
      <Toast ref={toast} position="bottom-center" />

      <Button
        label="Add a New Trigger Word"
        icon="pi pi-plus"
        className="p-1 bg-transparent border-0 text-primary dark:text-secondary col-span-12 lg:col-span-3 lg:justify-self-end justify-self-start self-center"
        onClick={() => setIsOpen(true)}
      />
      <Dialog
        header="Create a New Trigger Word"
        visible={isOpen}
        dismissableMask
        resizable
        className="w-[60rem]"
        onHide={() => {
          if (!isOpen) return;
          setNewTriggerWord(initialNewTrigger);
          setIsOpen(false);
        }}
        maximizable
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              trigger_words.some(
                (d) =>
                  stemmer(d.toLowerCase().trim()) ===
                  stemmer(newTriggerWord.trigger_word.toLowerCase().trim()),
              )
            ) {
              show();
              return;
            }
            addTemporary.mutate({
              trigger_word: newTriggerWord.trigger_word,
              facilities: newTriggerWord.internal_facility_id,
              // user_id: user_data.email,
              // from_to: newTriggerWord.date_range,
            });
            setIsOpen(false);
            setNewTriggerWord(initialNewTrigger);
          }}
          className="px-4"
        >
          <div className="flex flex-col gap-6">
            <p className="text-sm italic">
              Info: Keywords search will be implemented in 20 minutes, semantic
              search will be implemented tomorrow.
            </p>
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
                    keyword_list:
                      e.value?.map((d) => d.toLowerCase().trim()) || [],
                  }));
                }}
                allowDuplicate={false}
                className="w-full"
                separator=","
                pt={{
                  container: () => 'flex flex-wrap gap-1.5 w-full ',
                  token: () =>
                    clsx(highlightColors.map((d) => `has-[.${d}]:${d}`)),
                }}
                itemTemplate={(item) =>
                  customTemplate(item, newTriggerWord.keyword_list)
                }
              />
            </Field>
            {newTriggerWord.keyword_list.length > 0 &&
              filteredData.length > 0 && (
                <>
                  <p>{filteredData.length} Results Found</p>
                  <DataTable
                    value={filteredData}
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  >
                    <Column
                      field="patient_name"
                      header="Patient Name"
                      body={patientNameTemplate}
                    />
                    <Column
                      field="progress_note"
                      header="Progress Note"
                      body={progressNoteTemplate}
                    />
                  </DataTable>
                </>
              )}
            {newTriggerWord.keyword_list.length > 0 &&
              filteredData.length === 0 && <p>No Results Found</p>}
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
