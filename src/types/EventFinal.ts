export type ProgressNote = {
  progress_note_id: number;
  created_date: Date;
  category: string;
  note: string;
  created_by: string;
};

export type Task = {
  category: string;
  corresponding_id: number;
  task: string;
  status: string;
  due: Date;
};

export type EventFinal = {
  event_id: number;
  internal_facility_id: string;
  facility_name: string;
  upstream: string;
  patient_name: string;
  patient_id: string;
  occurrence: string;
  occurrence_date: Date;
  created_by: string;
  progress_notes: ProgressNote[];
  tasks: Task[];
};
