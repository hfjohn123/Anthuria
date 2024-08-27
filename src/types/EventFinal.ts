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
  // revision_by: string;
  progress_notes: {
    created_date: Date;
    category: string;
    note: string;
    created_by: string;
  }[];
};
