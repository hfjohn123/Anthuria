import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { createToast } from '../../../hooks/fireToast.tsx';
import stemFiltering from '../../../common/stemFiltering.ts';
import { forwardRef, RefObject, useContext, useState } from 'react';
import { AuthContext } from '../../../components/AuthWrapper.tsx';
import { Toast } from 'primereact/toast';
import { TriggerFinal } from '../../../types/TriggerFinal.ts';
import { Field, Label } from '@headlessui/react';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Chips } from 'primereact/chips';
import highlightColors from '../../../common/highlightColors.ts';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import highlightGenerator from '../../../common/highlightGenerator.ts';
import LineClampShowMore from '../../../common/LineClampShowMore.tsx';

const getColorClass = (index: number) => {
  return highlightColors[index % highlightColors.length];
};

const customTemplate = (item: string, result: string[]) => {
  const index = result.indexOf(item);
  return <span className={`${getColorClass(index)}`}>{item}</span>;
};
const progressNoteTemplate = ({
  d,
  keywordList,
}: {
  d: TriggerFinal;
  keywordList: string[];
}) => {
  return (
    <LineClampShowMore className="whitespace-pre-line">
      {highlightGenerator(d.progress_note, keywordList).map(
        (segment, index) => (
          <span
            key={index}
            className={
              segment.isMatch && segment.termIndex !== undefined
                ? `${highlightColors[segment.termIndex % highlightColors.length]} px-1 rounded`
                : ''
            }
            title={segment.isMatch ? `Match: ${segment.term}` : undefined}
          >
            {segment.text}
          </span>
        ),
      )}
    </LineClampShowMore>
  );
};

const patientNameTemplate = (d: TriggerFinal) => {
  return (
    <div>
      <p>{d.patient_name}</p>
      <p className="text-body-2">{d.facility_name}</p>
    </div>
  );
};

const KeywordForm = forwardRef<
  MultiSelect,
  {
    trigger_words: string[];
    toast: RefObject<Toast>;
    data: TriggerFinal[];
    initialNewTrigger: {
      group_name: string;
      trigger_word: string;
      internal_facility_id: string[];
      keyword_list: string[];
    };
    callback?: () => void;
    isNew?: boolean;
  }
>(({ trigger_words, toast, data, initialNewTrigger, callback, isNew }, ref) => {
  const { user_applications_locations, user_data, route } =
    useContext(AuthContext);
  const { locations } = user_applications_locations.find(
    (d) => d['id'] === 'trigger_words',
  ) || { locations: [] };
  const queryClient = useQueryClient();
  const new_keyword = initialNewTrigger.keyword_list.filter((d) => d !== '');

  const [newTriggerWord, setNewTriggerWord] = useState<{
    group_name: string;
    trigger_word: string;
    internal_facility_id: string[];
    keyword_list: string[];
    // date_range: [Date | null, Date | null];
  }>({
    ...initialNewTrigger,
    keyword_list: new_keyword,
  });

  const addTemporary = useMutation({
    mutationFn: ({
      group_name,
      trigger_word,
      facilities,
      key_words,
      // from_to,
    }: {
      group_name: string;
      trigger_word: string;
      facilities: string[];
      key_words: string[];
      // from_to: [Date | null, Date | null];
    }) =>
      axios.post(
        `https://triggerword_temporary_api.triedgesandbox.com/create_key_words`,
        {
          group_name,
          trigger_word,
          facilities,
          key_words,
          user_id: user_data?.email,
        },
      ),
    onMutate: () => {
      toast.current?.show({
        severity: 'info',
        summary: 'Creating Trigger Word',
        detail: 'Please Wait, it may take a few minutes',
      });
    },
    onSuccess: () => {
      createToast(
        'Success',
        'Trigger Word Creation in Progress, It would appear tomorrow',
        0,
        'new trigger',
      );
      queryClient.invalidateQueries({
        queryKey: ['trigger_word_view_trigger_word_detail_final', route],
      });
    },
    onError: (error: AxiosError) => {
      createToast(
        'Something went wrong',
        (error.response?.data as { detail: string }).detail,
        2,
        'new trigger',
      );
    },
    scope: {
      id: 'addTemporary',
    },
  });
  const removeTemporary = useMutation({
    mutationFn: ({ facilities }: { facilities: string[] }) =>
      axios.post(
        `https://triggerword_temporary_api.triedgesandbox.com/deactive_trigger_word`,
        {
          group_name: initialNewTrigger.group_name,
          facilities,
        },
      ),
    onError: (error: AxiosError) => {
      createToast(
        'Something went wrong',
        (error.response?.data as { detail: string }).detail,
        2,
        'new trigger',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trigger_word_view_trigger_word_detail_final', route],
      });
    },
    scope: {
      id: 'removeTemporary',
    },
  });
  const filteredData =
    (data &&
      data.filter(
        (d) =>
          newTriggerWord.internal_facility_id.includes(
            d.internal_facility_id,
          ) &&
          newTriggerWord.keyword_list.some(
            (keyword) =>
              d.progress_note && stemFiltering(d.progress_note, keyword),
          ),
      )) ||
    [];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (newTriggerWord === initialNewTrigger) {
          callback?.();
          return;
        }
        if (newTriggerWord.group_name.trim() === '') {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Please enter category name',
          });
          return;
        }
        if (newTriggerWord.internal_facility_id.length === 0) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Please add at least one facility',
          });
          return;
        }
        if (
          trigger_words
            .filter((d) => d !== initialNewTrigger.group_name)
            .some(
              (d) =>
                d.toLowerCase().trim() ===
                newTriggerWord.group_name.toLowerCase().trim(),
            )
        ) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Category name already exists',
          });
          return;
        }
        if (
          newTriggerWord.internal_facility_id.length <
          initialNewTrigger.internal_facility_id.length
        ) {
          removeTemporary.mutate({
            facilities: initialNewTrigger.internal_facility_id.filter(
              (d) => !newTriggerWord.internal_facility_id.includes(d),
            ),
          });
          addTemporary.mutate({
            group_name: newTriggerWord.group_name,
            trigger_word: newTriggerWord.trigger_word,
            facilities: newTriggerWord.internal_facility_id,
            key_words: newTriggerWord.keyword_list,
          });

          callback?.();
          return;
        }
        addTemporary.mutate({
          group_name: newTriggerWord.group_name,
          trigger_word: newTriggerWord.trigger_word,
          facilities: newTriggerWord.internal_facility_id,
          key_words: newTriggerWord.keyword_list,
        });
        callback?.();
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
          <Label className="text-sm dark:text-bodydark2">Category Name</Label>
          <InputText
            value={newTriggerWord.group_name}
            onChange={(e) => {
              setNewTriggerWord((prev) => ({
                ...prev,
                group_name: e.target.value,
              }));
            }}
            size="large"
            className="w-full"
            type="text"
          />
        </Field>
        <Field>
          <Label className="text-sm dark:text-bodydark2">Trigger Word</Label>
          <InputText
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
            value={newTriggerWord.internal_facility_id}
            optionLabel="label"
            optionValue="value"
            display="chip"
            ref={ref}
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
              newTriggerWord.keyword_list?.length > 0 ? '' : 'Enter keywords...'
            }
            onChange={(e) => {
              setNewTriggerWord((prev) => ({
                ...prev,
                keyword_list: e.value?.map((d) => d.toLowerCase().trim()) || [],
              }));
            }}
            allowDuplicate={false}
            className="w-full"
            separator=","
            pt={{
              container: () => 'flex flex-wrap gap-1.5 w-full ',
              token: () =>
                'has-[.bg-yellow-200]:bg-yellow-200 has-[.bg-green-200]:bg-green-200 has-[.bg-blue-200]:bg-blue-200 has-[.bg-pink-200]:bg-pink-200 has-[.bg-purple-200]:bg-purple-200 has-[.bg-orange-200]:bg-orange-200',
            }}
            itemTemplate={(item) =>
              customTemplate(item, newTriggerWord.keyword_list)
            }
          />
        </Field>
        {newTriggerWord.keyword_list.length > 0 && filteredData.length > 0 && (
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
                body={(d) =>
                  progressNoteTemplate({
                    keywordList: newTriggerWord.keyword_list,
                    d,
                  })
                }
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
            onClick={(event) => {
              event.preventDefault();
              callback?.();
              setNewTriggerWord(initialNewTrigger);
            }}
          >
            Cancel
          </button>
          {!isNew && (
            <button
              onClick={(event) => {
                event.preventDefault();
                removeTemporary.mutate({
                  facilities: initialNewTrigger.internal_facility_id,
                });
                callback?.();
              }}
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            className="bg-primary text-white dark:text-bodydark1 rounded p-2"
          >
            Submit
          </button>
        </div>
      </div>
    </form>
  );
});
KeywordForm.displayName = 'KeywordForm';
export default KeywordForm;
